import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/** Optional text fields accompanying the multipart profile-image upload. */
export class UploadImageBodyDto {
  @ApiPropertyOptional({
    description: 'Id of a previously-uploaded asset to delete after the new one is stored.',
  })
  @IsOptional()
  @IsString()
  replaceAssetId?: string;
}
