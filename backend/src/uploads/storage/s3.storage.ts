import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { AppConfig } from '../../config/configuration';
import type { StorageProvider, StoredObject, UploadFile } from './storage.interface';
import { imageExtension } from './storage.util';

type S3Config = AppConfig['storage']['s3'];

/**
 * S3 (or any S3-compatible store: R2, MinIO, …). Objects are uploaded under a
 * `profile-images/` prefix with public-read ACL and served either from a custom
 * public base URL (CDN) or the default bucket URL.
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = 's3';
  private readonly client: S3Client;
  private readonly keyPrefix = 'profile-images';

  constructor(private readonly config: S3Config) {
    if (!config.bucket || !config.region || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error(
        'S3 storage selected but S3_BUCKET/S3_REGION/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY are not all set.',
      );
    }
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
    });
  }

  async upload(file: UploadFile): Promise<StoredObject> {
    const key = `${this.keyPrefix}/${randomUUID()}.${imageExtension(file.mimetype, file.originalName)}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );
    return {
      provider: this.name,
      key,
      url: this.publicUrl(key),
      bytes: file.buffer.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }

  private publicUrl(key: string): string {
    if (this.config.publicBaseUrl) {
      return `${this.config.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    if (this.config.endpoint) {
      return `${this.config.endpoint.replace(/\/$/, '')}/${this.config.bucket}/${key}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
}
