import Router from "@koa/router";
import Koa from "koa";
import cors from "@koa/cors";
import koaBodyparser from "koa-bodyparser";
import koaLogger from "koa-logger";
import setupAuthController from "./controllers/auth.js";
import setupStorageController from "./controllers/storage.js";
import setupJobsController from "./controllers/jobs.js";

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

export default app;
