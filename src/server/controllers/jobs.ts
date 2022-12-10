import Router from "@koa/router";
import { authenticate } from "./auth.js";
import config from "@/config.js";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import { nanoid } from "nanoid";
import { formatBytes } from "@/utils.js";

export default function setupStorageController(router: Router) {
  // Get all jobs.
  // TODO: Pagination.
  router.get("/v1/jobs", async (ctx, next) => {});
}
