import config from "@/config.js";
import Database from "better-sqlite3";

export function open(trace: boolean = false) {
  const db = new Database(config.db.url.host + config.db.url.pathname, {
    fileMustExist: true,
    verbose: trace ? console.log : undefined,
  });

  db.pragma("journal_mode = WAL");

  return db;
}

export default open();
