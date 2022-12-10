import Address from "@/models/address.js";
import { BigNumber, ethers } from "ethers";
import { Event } from "@/models/Event.js";
import { Database } from "better-sqlite3";

export class MintFresh extends Event {
  static BLOCK_COLUMN = "job_board_mint_fresh_block";

  static parse(event: ethers.Event): MintFresh[] {
    return [
      new MintFresh(
        event.blockNumber,
        event.transactionHash,
        event.logIndex,
        new Address(event.address),
        event.args!.id as BigNumber,
        event.args!.codec as number,
        new Address(event.args!.author as string),
        event.args!.value as BigNumber
      ),
    ];
  }

  static insertBulk(db: Database, events: MintFresh[]): void {
    const stmt = db.prepare(
      `INSERT INTO job_board_mint_fresh (
        block_number,
        log_index,
        tx_hash,
        contract_address,
        id,
        codec,
        author,
        [value]
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING`
    );

    for (const event of events) {
      stmt.run(
        event.blockNumber,
        event.logIndex,
        event.transactionHash,
        event.contract.toString(),
        event.id.toString(),
        event.codec,
        event.author.toString(),
        event.value.toString()
      );
    }
  }

  constructor(
    blockNumber: number,
    transactionHash: string,
    logIndex: number,
    contract: Address,
    public readonly id: BigNumber,
    public readonly codec: number,
    public readonly author: Address,
    public readonly value: BigNumber
  ) {
    super(blockNumber, transactionHash, logIndex, contract);
  }
}
