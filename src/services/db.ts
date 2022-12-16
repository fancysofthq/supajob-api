import config from "@/config.js";
import Database from "better-sqlite3";

export function open(trace: boolean = false) {
  const path = config.db.url.host + config.db.url.pathname;
  if (trace) console.debug("Opening database connection", path);

  const db = new Database(path, {
    verbose: trace ? console.log : undefined,
  });

  db.pragma("journal_mode = WAL");

  return db;
}

export default open();
