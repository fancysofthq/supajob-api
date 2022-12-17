import { Database } from "better-sqlite3";
import { ethers } from "ethers";
import { timer } from "@/utils.js";
import pRetry, { AbortError } from "p-retry";
import { getProvider } from "@/services/eth.js";

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
  ]);
}

const BATCH = 240; // Approximately 1 hour.

/**
 * Synchronize past events continuously.
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
      await pRetry(() => contract.provider.getBlockNumber(), {
        onFailedAttempt: async (error) => {
          if (error instanceof AbortError) throw error;
          await getProvider();
        },
      }),
    ]);

    const diff = currentBlock - latestSyncedBlock;
    const delta = Math.min(diff, BATCH);

    if (delta > 0) {
      const untilBlock = latestSyncedBlock + delta;

      const rawEvents = await pRetry(
        () => contract.queryFilter(filter, latestSyncedBlock, untilBlock),
        {
          onFailedAttempt: async (error) => {
            if (error instanceof AbortError) throw error;
            await getProvider();
          },
        }
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
      })();
    }

    if (delta == diff) await timer(pollInterval);
  }
}
