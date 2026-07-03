import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import type { StorageProvider, StoredObject, UploadFile } from './storage.interface';
import { imageExtension } from './storage.util';

/**
 * Dev/default provider. Writes files to a local directory (served by Express at
 * /uploads, see main.ts). No external credentials required. Not for production.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly dir: string;

  constructor(
    dir: string,
    private readonly baseUrl: string,
  ) {
    this.dir = resolve(process.cwd(), dir);
  }

  async upload(file: UploadFile): Promise<StoredObject> {
    await mkdir(this.dir, { recursive: true });
    const key = `${randomUUID()}.${imageExtension(file.mimetype, file.originalName)}`;
    await writeFile(join(this.dir, key), file.buffer);
    this.logger.debug(`Stored upload locally: ${key}`);
    return {
      provider: this.name,
      key,
      url: `${this.baseUrl.replace(/\/$/, '')}/${key}`,
      bytes: file.buffer.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    // Guard against path traversal via a crafted key.
    const target = resolve(this.dir, key);
    if (!target.startsWith(this.dir)) return;
    await rm(target, { force: true });
  }
}
