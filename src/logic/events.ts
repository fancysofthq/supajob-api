import config from "../config.js";
import { ethers } from "ethers";
import { JobBoardFactory } from "@/contracts/JobBoardFactory.js";
import { syncEvents } from "./EventDB.js";
import { Transfer } from "@/models/JobBoard/events/Transfer.js";
import { Mint } from "@/models/JobBoard/events/Mint.js";
import { MintFresh } from "@/models/JobBoard/events/MintFresh.js";
import * as db from "@/services/db.js";

export async function sync(cancel: () => boolean) {
  const provider = new ethers.providers.JsonRpcProvider(config.eth.rpcUrl);
  console.debug("Connecting to wallet provider");
  const blockNumber = await provider.getBlockNumber();
  console.log("Current block number:", blockNumber);
  await Promise.all([syncJobBoard(provider, cancel)]);
}

export async function syncJobBoard(
  provider: ethers.providers.JsonRpcProvider,
  cancel: () => boolean
) {
  const contract = JobBoardFactory.connect(
    config.eth.jobBoardAddress.toString(),
    provider
  );

  const deployBlock = (await provider.getTransaction(config.eth.jobBoardTx))
    .blockNumber;
  if (!deployBlock) throw new Error("JobBoard deploy block not found");

  await Promise.all([
    syncEvents<Transfer>(
      await db.open(),
      Transfer.BLOCK_SINGLE_COLUMN,
      15 * 1000,
      cancel,
      contract,
      deployBlock,
      contract.filters.TransferSingle(null, null, null, null, null),
      Transfer.parseTransferSingle,
      Transfer.insertBulk
    ),

    syncEvents<Transfer>(
      await db.open(),
      Transfer.BLOCK_BATCH_COLUMN,
      15 * 1000,
      cancel,
      contract,
      deployBlock,
      contract.filters.TransferBatch(null, null, null, null, null),
      Transfer.parseTransferBatch,
      Transfer.insertBulk
    ),

    syncEvents<Mint>(
      await db.open(),
      Mint.BLOCK_COLUMN,
      15 * 1000,
      cancel,
      contract,
      deployBlock,
      contract.filters.Mint(null, null),
      Mint.parse,
      Mint.insertBulk
    ),

    syncEvents<MintFresh>(
      await db.open(),
      MintFresh.BLOCK_COLUMN,
      15 * 1000,
      cancel,
      contract,
      deployBlock,
      contract.filters.MintFresh(null, null, null, null),
      MintFresh.parse,
      MintFresh.insertBulk
    ),
  ]);
}
