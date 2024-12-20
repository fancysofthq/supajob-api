import { IIPNFT__factory } from "@fancysoft/contracts/typechain";
import { ClaimEvent } from "@fancysoft/contracts/typechain/@nxsf/ipnft/contracts/IIPNFT";
import db from "@/services/db";
import { provider } from "@/services/eth";
import { Address, Bytes, Hash } from "@fancysofthq/supabase";
import { sync, Job } from "@/shared/sync";
import { Config } from "../Config";

export class IIPNFTClaimJob implements Job {
  readonly eventTable = "iipnft_claim";

  constructor(public readonly config: Config) {}

  async run(cancel: () => boolean) {
    const contract = IIPNFT__factory.connect(
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
      contract.filters.Claim(),
      (db, events: ClaimEvent[]) => {
        const stmt = db.prepare(
          `INSERT INTO ${this.eventTable} (
            block_number,
            log_index,
            tx_hash,
            contract_address,

            content_id,
            content_author,
            content_codec,
            multihash_codec
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT DO NOTHING`
        );

        for (const event of events) {
          stmt.run(
            event.blockNumber,
            event.logIndex,
            Hash.from(event.transactionHash).bytes,
            Address.from(event.address).bytes,

            Bytes.from(event.args.contentId).bytes,
            Address.from(event.args.contentAuthor).bytes,
            event.args.contentCodec,
            event.args.multihashCodec
          );
        }
      },
      cancel
    );
  }
}
