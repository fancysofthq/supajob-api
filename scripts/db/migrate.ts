import db from "@/services/db";
import fs from "fs";
import path from "path";

export async function migrate(
  dir: string = "./db/migrations",
  to?: number,
  migrationTable = "_migrations"
) {
  let from: number;

  db.exec(
    `CREATE TABLE IF NOT EXISTS ${migrationTable} (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );

  from =
    db
      .prepare(
        `SELECT id
        FROM ${migrationTable}
        ORDER BY id DESC
        LIMIT 1`
      )
      .pluck()
      .get() || 0;

  const dirPath = path.join(process.cwd(), dir);
  const fileNames = fs.readdirSync(dirPath);

  to ||= fileNames.length;

  if (to == 0) {
    console.error("No migration files to run!");
    process.exit(1);
  } else if (from == to) {
    console.log(`Already at version ${to}, exiting`);
    process.exit(0);
  } else {
    console.log(`Running migrations from ${from} to ${to}...`);
  }

  const updateMigrationStmt = db.prepare(
    `INSERT INTO ${migrationTable} (name) VALUES (?)`
  );

  let i = 0;
  for (const fileName of fileNames.slice(from, to)) {
    console.log(`Running migration ${from + i} -> ${from + 1 + i}...`);
    const sql = fs.readFileSync(`${dir}/${fileName}`, "utf8");

    db.transaction(() => {
      db.exec(sql);
      updateMigrationStmt.run(fileName);
    })();

    i++;
  }

  console.log(`Successfully run ${to - from} migrations`);
}

migrate();
process.exit(0);
