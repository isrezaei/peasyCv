/** A binary upload handed to a storage provider. */
export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  /** Original client filename (used only to derive an extension). */
  originalName: string;
}

/** The result of persisting an upload to a storage backend. */
export interface StoredObject {
  /** Which provider stored it: "local" | "s3" | "cloudinary". */
  provider: string;
  /** Provider-specific key (object key / public_id / relative path) for deletion. */
  key: string;
  /** Public, directly-loadable URL. */
  url: string;
  /** Dimensions/size when the provider reports them (e.g. Cloudinary). */
  width?: number;
  height?: number;
  bytes?: number;
}

/** Pluggable storage backend. The active implementation is chosen by env. */
export interface StorageProvider {
  readonly name: string;
  upload(file: UploadFile): Promise<StoredObject>;
  delete(key: string): Promise<void>;
}

/** DI token for the configured storage provider. */
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
