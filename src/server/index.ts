import Router from "@koa/router";
import Koa from "koa";
import http2 from "http2";
import cors from "@koa/cors";
import koaBodyparser from "koa-bodyparser";
import koaLogger from "koa-logger";
import setupAuthController from "./controllers/auth.js";
import setupStorageController from "./controllers/storage.js";
import setupJobsController from "./controllers/jobs.js";
import fs from "fs";
import config from "@/config.js";

const app = new Koa();
const router = new Router();

router.get("/", (ctx) => {
  ctx.body = "Hello, World!";
});

setupAuthController(router);
setupStorageController(router);
setupJobsController(router);

app
  .use(koaLogger())
  .use(cors())
  .use(koaBodyparser())
  .use(router.routes())
  .use(router.allowedMethods());

let server: http2.Http2SecureServer | http2.Http2Server;

if (config.server.credentials) {
  server = http2.createSecureServer(
    {
      cert: fs.readFileSync(config.server.credentials.crtPath),
      key: fs.readFileSync(config.server.credentials.keyPath),
    },
    app.callback()
  );
} else {
  server = http2.createServer(app.callback());
}

export default server;
