import Router from "@koa/router";
import Koa from "koa";
import http2 from "http2";
import cors from "@koa/cors";
import koaBodyparser from "koa-bodyparser";
import koaLogger from "koa-logger";
import setupAuthController from "./controllers/auth.js";
import setupStorageController from "./controllers/storage.js";
import fs from "fs";

const app = new Koa();
const router = new Router();

router.get("/", (ctx) => {
  ctx.body = "Hello, World!";
});

setupAuthController(router);
setupStorageController(router);

app
  .use(koaLogger())
  .use(cors())
  .use(koaBodyparser())
  .use(router.routes())
  .use(router.allowedMethods());

export default http2.createSecureServer(
  {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
  },
  app.callback()
);
