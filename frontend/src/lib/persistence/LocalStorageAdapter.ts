import type { StorageAdapter } from "./StorageAdapter";

export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  async load(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async save(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  }
}
