import Address from "@/models/address.js";
import { BigNumber, ethers } from "ethers";
import { Event } from "@/models/Event.js";
import { Database } from "better-sqlite3";

export class Mint extends Event {
  static BLOCK_COLUMN = "job_board_mint_block";

  static parse(event: ethers.Event): Mint[] {
    return [
      new Mint(
        event.blockNumber,
        event.transactionHash,
        event.logIndex,
        new Address(event.address),
        event.args!.id as BigNumber,
        event.args!.value as BigNumber
      ),
    ];
  }

  static insertBulk(db: Database, events: Mint[]): void {
    const stmt = db.prepare(
      `INSERT INTO job_board_mint (
        block_number,
        log_index,
        tx_hash,
        contract_address,
        id,
        [value]
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING`
    );

    for (const event of events) {
      stmt.run(
        event.blockNumber,
        event.logIndex,
        event.transactionHash,
        event.contract.toString(),
        event.id._hex,
        event.value._hex
      );
    }
  }

  constructor(
    blockNumber: number,
    transactionHash: string,
    logIndex: number,
    contract: Address,
    public readonly id: BigNumber,
    public readonly value: BigNumber
  ) {
    super(blockNumber, transactionHash, logIndex, contract);
  }
}
