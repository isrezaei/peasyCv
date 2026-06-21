export interface StorageAdapter<T> {
  load(key: string): Promise<T | null>;
  save(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
