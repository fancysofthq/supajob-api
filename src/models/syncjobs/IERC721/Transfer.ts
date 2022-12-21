import { IERC721__factory } from "@fancysoft/contracts/typechain";
import { TransferEvent } from "@fancysoft/contracts/typechain/@openzeppelin/contracts/token/ERC721/IERC721";
import db from "@/services/db";
import { provider } from "@/services/eth";
import { Address, Bytes, Hash } from "@/models/Bytes";
import { sync, Job } from "@/shared/sync";
import { Config } from "../Config";

export class IERC721TransferJob implements Job {
  readonly eventTable = "ierc721_transfer";

  constructor(public readonly config: Config) {}

  async run(cancel: () => boolean) {
    const contract = IERC721__factory.connect(
      this.config.contractAddress.toString(),
      provider
    );

    sync(
      db,
      "sync_jobs",
      "historical_block",
      "realtime_block",
      "event_table",
      this.eventTable,
      contract,
      this.config.contractDeployTx,
      contract.filters.Transfer(),
      (db, events: TransferEvent[]) => {
        const stmt = db.prepare(
          `INSERT INTO ${this.eventTable} (
            block_number,
            log_index,
            tx_hash,
            contract_address,

            "from",
            "to",
            token_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT DO NOTHING`
        );

        for (const event of events) {
          stmt.run(
            event.blockNumber,
            event.logIndex,
            new Hash(event.transactionHash).bytes,
            new Address(event.address).bytes,

            new Address(event.args.from).bytes,
            new Address(event.args.to).bytes,
            new Bytes(event.args.tokenId._hex).bytes
          );
        }
      },
      cancel
    );
  }
}
