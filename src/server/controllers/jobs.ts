import Router from "@koa/router";
import db from "@/services/db.js";
import { CID } from "multiformats/cid";
import { digest } from "multiformats";
import { keccak256 } from "@multiformats/sha3";
import { Address, Bytes } from "@fancysofthq/supabase";
import config from "@/config";
import { Job } from "../types";

export default function setupJobsController(router: Router) {
  // Get all jobs.
  // TODO: Pagination.
  router.get("/v1/jobs", async (ctx, next) => {
    const jobs: Job[] = [];

    if (ctx.query.from) {
      if (typeof ctx.query.from !== "string") {
        ctx.throw(400, "from must be a string");
      }

      const author = Address.from(ctx.query.from as string);

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
          jobs.push(
            new Job(
              CID.createV1(
                row.content_codec as number,
                digest.create(keccak256.code, Bytes.from(row.content_id).bytes)
              ),
              author,
              row.block_number
            )
          );
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
          jobs.push(
            new Job(
              CID.createV1(
                row.content_codec as number,
                digest.create(keccak256.code, Bytes.from(row.content_id).bytes)
              ),
              Address.from(row.content_author),
              row.block_number
            )
          );
        });
    }

    ctx.body = jobs.map((job) => job.toJSON());

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
      .get(Bytes.from(cid.multihash.digest).bytes);

    if (!row) {
      ctx.status = 404;
      return;
    }

    ctx.body = new Job(
      cid,
      Address.from(row.content_author),
      row.block_number
    ).toJSON();
  });
}
