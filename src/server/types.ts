import { CID } from "multiformats/cid";
import { Address } from "@fancysofthq/supabase";

export class Job {
  constructor(
    public readonly cid: CID,
    public readonly author: Address,
    public readonly block: number
  ) {}

  static fromJSON(json: any): Job {
    return new Job(CID.parse(json.cid), Address.from(json.author), json.block);
  }

  toJSON(): any {
    return {
      cid: this.cid.toString(),
      author: this.author.toString(),
      block: this.block,
    };
  }
}
