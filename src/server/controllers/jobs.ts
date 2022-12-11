import Router from "@koa/router";
import db from "@/services/db.js";
import { MintFresh } from "@/models/JobBoard/events/MintFresh.js";
import { CID } from "multiformats/cid";
import { digest } from "multiformats";
import { keccak256 } from "@multiformats/sha3";
import Address from "@/models/address.js";

type Job = {
  cid: CID;
  author: Address;
  block: number;
};

type JobDto = {
  cid: string;
  author: string;
  block: number;
};

export default function setupJobsController(router: Router) {
  // Get all jobs.
  // TODO: Pagination.
  router.get("/v1/jobs", async (ctx, next) => {
    const jobs: Job[] = [];

    db.prepare(
      `
      SELECT id, codec, author, block_number
      FROM ${MintFresh.TABLE}
      ORDER BY block_number DESC`
    )
      .all()
      .forEach((row) => {
        jobs.push({
          cid: CID.createV1(
            row.codec as number,
            digest.create(
              keccak256.code,
              Buffer.from(row["id"].slice(2), "hex")
            )
          ),
          author: new Address(row.author),
          block: row.block_number,
        });
      });

    ctx.body = jobs.map(
      (job): JobDto => ({
        cid: job.cid.toString(),
        author: job.author.toString(),
        block: job.block,
      })
    );

    next();
  });

  router.get("/v1/jobs/:cid", async (ctx, next) => {
    const cid = CID.parse(ctx.params.cid);

    const row = db
      .prepare(
        `
        SELECT id, codec, author, block_number
        FROM ${MintFresh.TABLE}
        WHERE id = ?`
      )
      .get("0x" + Buffer.from(cid.multihash.digest).toString("hex"));

    if (!row) {
      ctx.status = 404;
      return;
    }

    const job: Job = {
      cid,
      author: new Address(row.author),
      block: row.block_number,
    };

    const jobDto: JobDto = {
      cid: job.cid.toString(),
      author: job.author.toString(),
      block: job.block,
    };

    ctx.body = jobDto;
  });
}
