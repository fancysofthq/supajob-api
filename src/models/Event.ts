import Address from "./address.js";

export abstract class Event {
  constructor(
    public readonly blockNumber: number,
    public readonly transactionHash: string,
    public readonly logIndex: number,
    public readonly contract: Address
  ) {}
}
