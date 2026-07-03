import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { TemplateId } from '@resume/types';
import { LOCALES, TEMPLATE_IDS } from '../resume.constants';

/**
 * Body for POST /resumes. Everything is optional — the server fills a complete,
 * schema-valid default resume (Persian seed content) for any field not provided.
 */
export class CreateResumeDto {
  @ApiPropertyOptional({ example: 'رزومه من' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ enum: TEMPLATE_IDS, example: 'professional-single-column' })
  @IsOptional()
  @IsIn(TEMPLATE_IDS)
  templateId?: TemplateId;

  @ApiPropertyOptional({ enum: LOCALES, example: 'fa' })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: 'fa' | 'en';
}
