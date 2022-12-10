declare module "sqlite3-trans" {
  import sqlite3 from "sqlite3";
  import { Database } from "sqlite";
  export function wrap(db: Database): Database;
}
