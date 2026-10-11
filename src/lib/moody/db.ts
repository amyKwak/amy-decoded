import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Entry } from "./types";

/** Browser-only storage. Entries never leave the visitor's device on their own. */
interface MoodyDB extends DBSchema {
  entries: { key: string; value: Entry; indexes: { date: string } };
}

let dbPromise: Promise<IDBPDatabase<MoodyDB>> | null = null;

function db() {
  dbPromise ??= openDB<MoodyDB>("moody", 1, {
    upgrade(database) {
      const store = database.createObjectStore("entries", { keyPath: "id" });
      store.createIndex("date", "date");
    },
  });
  return dbPromise;
}

export async function getAllEntries(): Promise<Entry[]> {
  const all = await (await db()).getAll("entries");
  // Newest first; same-day entries by time saved.
  return all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

export async function putEntry(entry: Entry): Promise<void> {
  await (await db()).put("entries", entry);
}

export async function putEntries(entries: Entry[]): Promise<void> {
  const tx = (await db()).transaction("entries", "readwrite");
  await Promise.all([...entries.map((e) => tx.store.put(e)), tx.done]);
}

export async function deleteEntry(id: string): Promise<void> {
  await (await db()).delete("entries", id);
}

export async function deleteDemoEntries(): Promise<void> {
  const database = await db();
  const tx = database.transaction("entries", "readwrite");
  for (const e of await tx.store.getAll()) {
    if (e.demo) await tx.store.delete(e.id);
  }
  await tx.done;
}
