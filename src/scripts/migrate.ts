import { open } from "@/services/db.js";
import fs from "fs";
import path from "path";

export async function migrate(to?: number, dir: string = "./db/migrations") {
  const db = await open(true);
  let from: number;

  try {
    from = db.prepare(`SELECT migration FROM [state]`).pluck().get();
  } catch (e) {
    console.log(e);
    from = 0;
  }

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
    `UPDATE [state] SET migration = ?, migrated_at = CURRENT_TIMESTAMP`
  );

  for (const [fileName, i] of fileNames.slice(from, to)) {
    console.log(`Running migration ${from + i} -> ${from + 1 + i}...`);
    const sql = fs.readFileSync(`${dir}/${fileName}`, "utf8");
    db.transaction(() => {
      db.exec(sql);
      updateMigrationStmt.run(from + 1 + i);
    });
  }

  console.log(`Successfully run ${from - to} migrations`);
  process.exit(0);
}

migrate();
