import { Injectable } from '@angular/core';

const DB_NAME = 'mari-course-files';
const DB_VERSION = 1;
const STORE_NAME = 'blobs';

@Injectable({ providedIn: 'root' })
export class CourseFileStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  async saveBlob(fileId: string, blob: Blob): Promise<void> {
    const db = await this.openDb();
    await this.runTransaction(db, 'readwrite', (store) => store.put(blob, fileId));
  }

  async getBlob(fileId: string): Promise<Blob | null> {
    if (typeof indexedDB === 'undefined') return null;
    const db = await this.openDb();
    return this.runTransaction<Blob | null>(db, 'readonly', (store) => store.get(fileId));
  }

  async deleteBlob(fileId: string): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    const db = await this.openDb();
    await this.runTransaction(db, 'readwrite', (store) => store.delete(fileId));
  }

  async deleteBlobs(fileIds: string[]): Promise<void> {
    await Promise.all(fileIds.map((id) => this.deleteBlob(id)));
  }

  createObjectUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  revokeObjectUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  private openDb(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('IndexedDB is not available'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
      });
    }

    return this.dbPromise;
  }

  private runTransaction<T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = operation(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
    });
  }
}
