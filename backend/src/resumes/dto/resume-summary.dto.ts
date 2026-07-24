import { ApiProperty } from '@nestjs/swagger';
import type { ResumeSummary, TemplateId } from '@resume/types';

/** Lightweight row returned by GET /resumes (the resume list). */
export class ResumeSummaryDto implements ResumeSummary {
  @ApiProperty({ example: '8f0c1d2e-3a4b-5c6d-7e8f-9a0b1c2d3e4f' })
  id!: string;

  @ApiProperty({ example: 'رزومه من' })
  title!: string;

  @ApiProperty({ example: 'professional-single-column' })
  templateId!: TemplateId;

  @ApiProperty({
    example: 'software-it',
    nullable: true,
    description: 'Occupation-category id for this resume (null = not chosen).',
  })
  occupationCategory!: string | null;

  @ApiProperty({ example: '2026-06-27T12:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ example: '2026-06-27T11:00:00.000Z' })
  createdAt!: string;
}

/** Response of POST /resumes/:id/share. */
export class ShareLinkDto {
  @ApiProperty({ example: 'b1c2d3e4f5a6b7c8' })
  token!: string;

  @ApiProperty({
    example: 'http://localhost:3000/share/b1c2d3e4f5a6b7c8',
    description: 'Absolute public URL to the read-only view.',
  })
  url!: string;

  @ApiProperty({ example: true })
  enabled!: boolean;
}
