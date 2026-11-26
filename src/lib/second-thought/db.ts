import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ThoughtRecord } from "./types";

/** Browser-only storage. Records never leave the visitor's device on their own. */
interface SecondThoughtDB extends DBSchema {
  records: { key: string; value: ThoughtRecord; indexes: { date: string } };
}

let dbPromise: Promise<IDBPDatabase<SecondThoughtDB>> | null = null;

function db() {
  dbPromise ??= openDB<SecondThoughtDB>("second-thought", 1, {
    upgrade(database) {
      const store = database.createObjectStore("records", { keyPath: "id" });
      store.createIndex("date", "date");
    },
  });
  return dbPromise;
}

export async function getAllRecords(): Promise<ThoughtRecord[]> {
  const all = await (await db()).getAll("records");
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function putRecord(record: ThoughtRecord): Promise<void> {
  await (await db()).put("records", record);
}

export async function deleteRecord(id: string): Promise<void> {
  await (await db()).delete("records", id);
}
