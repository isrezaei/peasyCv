import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { ImageMeta } from '@resume/types';
import { PrismaService } from '../prisma/prisma.service';
import { readImageSize } from './image-size';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
  type UploadFile,
} from './storage/storage.interface';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /**
   * Store an uploaded profile image: push the binary to the configured storage
   * backend, record an Asset row (metadata only — kept separate from resume
   * content), and return an ImageMeta the frontend assigns to
   * personalInfo.profileImage. When `replaceAssetId` is given, the prior asset is
   * deleted afterwards so replacing a photo does not orphan storage objects.
   */
  async uploadProfileImage(
    userId: string,
    file: UploadFile,
    replaceAssetId?: string,
  ): Promise<ImageMeta> {
    const measured = readImageSize(file.buffer);
    const stored = await this.storage.upload(file);

    const width = stored.width ?? measured?.width ?? 0;
    const height = stored.height ?? measured?.height ?? 0;

    const asset = await this.prisma.asset.create({
      data: {
        userId,
        provider: stored.provider,
        key: stored.key,
        url: stored.url,
        width,
        height,
        bytes: stored.bytes ?? file.buffer.byteLength,
        mime: file.mimetype,
      },
    });

    if (replaceAssetId && replaceAssetId !== asset.id) {
      // Best-effort cleanup; never fail the upload because the old delete failed.
      await this.deleteAsset(userId, replaceAssetId).catch((error: unknown) => {
        this.logger.warn(`Failed to delete replaced asset ${replaceAssetId}: ${String(error)}`);
      });
    }

    return {
      id: asset.id,
      url: asset.url,
      originalUrl: asset.url,
      width,
      height,
      crop: null,
    };
  }

  async deleteAsset(userId: string, assetId: string): Promise<void> {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.userId !== userId) {
      throw new NotFoundException('Image not found.');
    }
    await this.storage.delete(asset.key);
    await this.prisma.asset.delete({ where: { id: assetId } });
  }
}
