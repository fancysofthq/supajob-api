import Router from "@koa/router";
import db from "@/services/db.js";
import { CID } from "multiformats/cid";
import { digest } from "multiformats";
import { keccak256 } from "@multiformats/sha3";
import { Address, Bytes } from "@/models/Bytes.js";
import config from "@/config";

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

    if (ctx.query.from) {
      if (typeof ctx.query.from !== "string") {
        ctx.throw(400, "from must be a string");
      }

      const author = new Address(ctx.query.from as string);

      db.prepare(
        `SELECT
          block_number,
          content_id,
          content_codec
        FROM iipnft_claim
        WHERE
          contract_address = ? AND
          content_author = ?`
      )
        .all(config.eth.jobContractAddress.bytes, author.bytes)
        .forEach((row) => {
          jobs.push({
            cid: CID.createV1(
              row.content_codec as number,
              digest.create(keccak256.code, new Bytes(row.content_id).bytes)
            ),
            author,
            block: row.block_number,
          });
        });
    } else {
      db.prepare(
        `SELECT
          block_number,
          content_id,
          content_codec,
          content_author
        FROM iipnft_claim
        WHERE contract_address = ?`
      )
        .all(config.eth.jobContractAddress.bytes)
        .forEach((row) => {
          jobs.push({
            cid: CID.createV1(
              row.content_codec as number,
              digest.create(keccak256.code, new Bytes(row.content_id).bytes)
            ),
            author: new Address(row.content_author),
            block: row.block_number,
          });
        });
    }

    ctx.body = jobs.map(
      (job): JobDto => ({
        cid: job.cid.toString(),
        author: job.author.toString(),
        block: job.block,
      })
    );

    next();
  });

  // Get a job by its CID.
  router.get("/v1/jobs/:cid", async (ctx, next) => {
    const cid = CID.parse(ctx.params.cid);

    const row = db
      .prepare(
        `SELECT block_number, content_author
        FROM iipnft_claim
        WHERE content_id = ?`
      )
      .get(new Bytes(cid.multihash.digest).bytes);

    if (!row) {
      ctx.status = 404;
      return;
    }

    const job: Job = {
      cid,
      author: new Address(row.content_author),
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
