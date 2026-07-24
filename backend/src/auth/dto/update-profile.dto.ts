import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  OCCUPATION_CATEGORY_IDS,
  type OccupationCategoryId,
} from '../occupation-category.constants';

/**
 * PATCH /auth/me — the single authenticated write path for profile fields the
 * user may edit about themselves. Deliberately minimal: occupationCategory only.
 *
 * SECURITY: isAdmin is (and must stay) absent here and in every writable DTO;
 * the global ValidationPipe whitelist strips any extra keys before they reach
 * the service.
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    enum: OCCUPATION_CATEGORY_IDS,
    example: 'software-it',
    description:
      'Broad occupation category (drives the resume default-content tailoring). Fixed list; "azad" is the generic fallback.',
  })
  @IsOptional()
  @IsIn(OCCUPATION_CATEGORY_IDS)
  occupationCategory?: OccupationCategoryId;
}
