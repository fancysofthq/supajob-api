import Router from "@koa/router";
import { authenticate } from "./auth.js";
import config from "@/config.js";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import { nanoid } from "nanoid";
import { formatBytes } from "@/utils.js";

export default function setupStorageController(router: Router) {
  router.post("/v1/storeCar", async (ctx, next) => {
    const jwt = await authenticate(ctx);

    // TODO: May ban an address for abuse.
    if (!jwt || !jwt.payload.addr) ctx.throw(403);

    // Save the request body to tmp file.
    const tmpFile = os.tmpdir() + "/" + nanoid();
    const fileStream = fs.createWriteStream(tmpFile);
    await new Promise((resolve, reject) => {
      ctx.req.pipe(fileStream);
      ctx.req.on("error", reject);
      fileStream.on("finish", resolve);
    });
    const fileSize = fs.statSync(tmpFile).size;

    console.log(`Web3-storing ${formatBytes(fileSize)} from ${tmpFile}...`);

    const response = await fetch("https://api.web3.storage/car", {
      method: "POST",
      body: fs.createReadStream(tmpFile),
      headers: {
        Authorization: `Bearer ${config.web3StorageToken}`,
        "Content-Type": "application/vnd.ipld.car",
        "Content-Length": fileSize.toString(),
      },
    });

    if (!response.ok) {
      console.error(
        "Web3-storage failed",
        response.status,
        response.statusText,
        await response.text()
      );

      ctx.throw();
    }

    const body = (await response.json()) as { cid: string; carCid: string };
    console.debug(`Web3-stored ${JSON.stringify(body)}`);

    ctx.body = body.cid;
    ctx.status = 201;

    next();
  });
}
