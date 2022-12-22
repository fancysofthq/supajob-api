import { IERC721__factory } from "@fancysoft/contracts/typechain";
import { TransferEvent } from "@fancysoft/contracts/typechain/@openzeppelin/contracts/token/ERC721/IERC721";
import db from "@/services/db";
import { provider } from "@/services/eth";
import { Address, Bytes, Hash } from "@fancysofthq/supabase";
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
            Hash.from(event.transactionHash).bytes,
            Address.from(event.address).bytes,

            Address.from(event.args.from).bytes,
            Address.from(event.args.to).bytes,
            Bytes.from(event.args.tokenId._hex).bytes
          );
        }
      },
      cancel
    );
  }
}
