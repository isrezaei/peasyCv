import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { ImageMeta } from '@resume/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ImageMetaDto } from '../resumes/dto/resume-data.dto';
import { UploadsService } from './uploads.service';
import { UploadImageBodyDto } from './dto/upload-body.dto';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

@ApiTags('uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('profile-image')
  @ApiOperation({
    summary: 'Upload (or replace) a profile image. Returns an ImageMeta for the resume.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image (png/jpeg/webp/gif, ≤5MB).' },
        replaceAssetId: { type: 'string', description: 'Optional asset id to delete after upload.' },
      },
    },
  })
  @ApiOkResponse({ type: ImageMetaDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PNG, JPEG, WebP or GIF images are allowed.'), false);
        }
      },
    }),
  )
  uploadProfileImage(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadImageBodyDto,
  ): Promise<ImageMeta> {
    if (!file) {
      throw new BadRequestException('No file uploaded under field "file".');
    }
    return this.uploads.uploadProfileImage(
      userId,
      { buffer: file.buffer, mimetype: file.mimetype, originalName: file.originalname },
      body.replaceAssetId,
    );
  }

  @Delete(':assetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an uploaded image (storage object + metadata).' })
  @ApiNoContentResponse()
  deleteImage(
    @CurrentUser('id') userId: string,
    @Param('assetId') assetId: string,
  ): Promise<void> {
    return this.uploads.deleteAsset(userId, assetId);
  }
}
