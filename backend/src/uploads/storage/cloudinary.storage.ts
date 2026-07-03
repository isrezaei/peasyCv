import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import type { AppConfig } from '../../config/configuration';
import type { StorageProvider, StoredObject, UploadFile } from './storage.interface';

type CloudinaryConfig = AppConfig['storage']['cloudinary'];

/**
 * Cloudinary provider. Uploads the buffer via a base64 data URI and returns the
 * delivered secure URL plus the dimensions Cloudinary reports.
 */
export class CloudinaryStorageProvider implements StorageProvider {
  readonly name = 'cloudinary';

  constructor(private readonly config: CloudinaryConfig) {
    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      throw new Error(
        'Cloudinary storage selected but CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are not all set.',
      );
    }
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  async upload(file: UploadFile): Promise<StoredObject> {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      folder: this.config.folder,
      resource_type: 'image',
    });
    return {
      provider: this.name,
      key: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key, { resource_type: 'image' });
  }
}
