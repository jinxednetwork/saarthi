"use client";

/**
 * Original document bytes live in IndexedDB, never localStorage (a 2 MB PDF as
 * base64 would blow the 5 MB localStorage budget instantly). The parsed record +
 * embeddings live in localStorage; the bytes are fetched on demand for preview
 * or download via a session object-URL. (Production: Cloud Storage signed URLs.)
 */
const DB_NAME = "saarthi-docs";
const STORE = "originals";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function putOriginal(id: string, blob: Blob): Promise<void> {
  try {
    await tx("readwrite", (s) => s.put(blob, id));
  } catch {
    /* storage unavailable — preview/download just won't be offered */
  }
}

export async function getOriginalUrl(id: string): Promise<string | null> {
  try {
    const blob = await tx<Blob | undefined>("readonly", (s) => s.get(id));
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}

export async function deleteOriginal(id: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}
