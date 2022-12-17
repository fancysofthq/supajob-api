import config from "../config.js";
import { JobBoardFactory } from "@/contracts/JobBoardFactory.js";
import * as EventDB from "./EventDB.js";
import { Transfer } from "@/models/JobBoard/events/Transfer.js";
import { Mint } from "@/models/JobBoard/events/Mint.js";
import { MintFresh } from "@/models/JobBoard/events/MintFresh.js";
import * as db from "@/services/db.js";
import { getProvider } from "@/services/eth.js";

export default async function sync(cancel: () => boolean) {
  await Promise.all([syncJobBoard(cancel)]);
}

export async function syncJobBoard(cancel: () => boolean) {
  const provider = await getProvider();

  const contract = JobBoardFactory.connect(
    config.eth.jobBoardAddress.toString(),
    provider
  );

  const deployBlock = (await provider.getTransaction(config.eth.jobBoardTx))
    .blockNumber;
  if (!deployBlock) throw new Error("JobBoard deploy block not found");

  await Promise.all([
    EventDB.syncEvents<Transfer>(
      db.open(),
      Transfer.BLOCK_SINGLE_COLUMN,
      15 * 1000,
      cancel,
      contract,
      deployBlock,
      contract.filters.TransferSingle(null, null, null, null, null),
      Transfer.parseTransferSingle,
      Transfer.insertBulk
    ),

    EventDB.syncEvents<Transfer>(
      db.open(),
      Transfer.BLOCK_BATCH_COLUMN,
      15 * 1000,
      cancel,
      contract,
      deployBlock,
      contract.filters.TransferBatch(null, null, null, null, null),
      Transfer.parseTransferBatch,
      Transfer.insertBulk
    ),

    EventDB.syncEvents<Mint>(
      db.open(),
      Mint.BLOCK_COLUMN,
      15 * 1000,
      cancel,
      contract,
      deployBlock,
      contract.filters.Mint(null, null),
      Mint.parse,
      Mint.insertBulk
    ),

    EventDB.syncEvents<MintFresh>(
      db.open(),
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
