import { Database } from "better-sqlite3";
import { ethers } from "ethers";
import { timer } from "@/utils.js";

export async function syncEvents<T>(
  db: Database,
  blockColumn: string,
  pollInterval: number,
  pollCancel: () => boolean,
  contract: ethers.Contract,
  contractDeployBlock: number,
  filter: ethers.EventFilter,
  parseRaw: (e: ethers.Event) => T[],
  insertBulk: (db: Database, events: T[]) => void
) {
  await Promise.all([
    syncPastEvents(
      db,
      blockColumn,
      pollInterval,
      pollCancel,
      contract,
      contractDeployBlock,
      filter,
      parseRaw,
      insertBulk
    ),
    subscribeToNewEvents(
      db,
      blockColumn,
      pollCancel,
      contract,
      filter,
      parseRaw,
      insertBulk
    ),
  ]);
}

const BATCH = 240; // Approximately 1 hour.

/**
 * Synchronize past events.
 */
async function syncPastEvents<T>(
  db: Database,
  blockColumn: string,
  pollInterval: number,
  pollCancel: () => boolean,
  contract: ethers.Contract,
  contractDeployBlock: number,
  filter: ethers.EventFilter,
  parseRaw: (e: ethers.Event) => T[],
  insertBulk: (db: Database, events: T[]) => void
): Promise<void> {
  const selectBlockColumnStmt = db
    .prepare(`SELECT ${blockColumn} FROM [state]`)
    .pluck();

  const updateBlockColumnStmt = db.prepare(
    `UPDATE [state] SET ${blockColumn} = ?`
  );

  while (!pollCancel()) {
    const [latestSyncedBlock, currentBlock] = await Promise.all([
      ((await selectBlockColumnStmt.get()) as number) || contractDeployBlock,
      contract.provider.getBlockNumber(),
    ]);

    const diff = currentBlock - latestSyncedBlock;
    const delta = Math.min(diff, BATCH);

    if (delta > 0) {
      const untilBlock = latestSyncedBlock + delta;

      const rawEvents = await contract.queryFilter(
        filter,
        latestSyncedBlock,
        untilBlock
      );

      const mappedEvents = rawEvents.flatMap(parseRaw);

      db.transaction(() => {
        const actualValue =
          (selectBlockColumnStmt.get() as number) || contractDeployBlock;

        if (actualValue != latestSyncedBlock) {
          return;
        }

        insertBulk(db, mappedEvents);
        updateBlockColumnStmt.run(untilBlock);
      });
    }

    if (delta == diff) await timer(pollInterval);
  }
}

/**
 * Subscribe to new events.
 */
async function subscribeToNewEvents<T>(
  db: Database,
  blockColumn: string,
  cancel: () => boolean,
  contract: ethers.Contract,
  filter: ethers.EventFilter,
  parseRaw: (e: ethers.Event) => T[],
  insertBulk: (db: Database, events: T[]) => void
): Promise<void> {
  const selectBlockColumnStmt = db
    .prepare(`SELECT ${blockColumn} FROM [state]`)
    .pluck();

  contract.on(filter, (...data) => {
    if (cancel()) {
      contract.removeAllListeners(filter);
      return;
    }

    const e: ethers.Event = data[data.length - 1];
    const latestSyncedBlock = selectBlockColumnStmt.get() as number;

    if (e.blockNumber > latestSyncedBlock) {
      const mappedEvents = parseRaw(e);

      if (mappedEvents.length > 0) {
        insertBulk(db, mappedEvents);
      }
    }
  });
}
