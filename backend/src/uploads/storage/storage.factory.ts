import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';
import { STORAGE_PROVIDER, type StorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';
import { S3StorageProvider } from './s3.storage';
import { CloudinaryStorageProvider } from './cloudinary.storage';

/**
 * Builds the configured storage backend once at boot. The chosen provider's
 * credentials are validated eagerly (the others are never constructed), so a
 * misconfigured S3/Cloudinary setup fails fast with a clear message.
 */
export const storageProviderFactory: Provider = {
  provide: STORAGE_PROVIDER,
  inject: [ConfigService],
  useFactory: (config: ConfigService<AppConfig, true>): StorageProvider => {
    const storage = config.get('storage', { infer: true });
    const logger = new Logger('StorageProvider');

    switch (storage.provider) {
      case 's3':
        logger.log('Using S3 storage provider for uploads');
        return new S3StorageProvider(storage.s3);
      case 'cloudinary':
        logger.log('Using Cloudinary storage provider for uploads');
        return new CloudinaryStorageProvider(storage.cloudinary);
      case 'local':
      default:
        logger.log(`Using local-disk storage provider (dir: ${storage.local.dir})`);
        return new LocalStorageProvider(storage.local.dir, storage.local.baseUrl);
    }
  },
};
