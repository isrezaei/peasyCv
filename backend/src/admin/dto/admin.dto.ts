import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { SELECTION_KINDS, type SelectionKind } from '../../metrics/selection.constants';

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Optional UTC-day range for the daily stats endpoints. */
export class DateRangeQueryDto {
  @ApiPropertyOptional({ example: '2026-06-01', description: 'Inclusive UTC day (YYYY-MM-DD).' })
  @IsOptional()
  @Matches(DAY_PATTERN)
  from?: string;

  @ApiPropertyOptional({ example: '2026-06-30', description: 'Inclusive UTC day (YYYY-MM-DD).' })
  @IsOptional()
  @Matches(DAY_PATTERN)
  to?: string;
}

/** Which selection dimension to aggregate, plus the shared UTC-day range. */
export class SelectionQueryDto extends DateRangeQueryDto {
  @ApiProperty({ enum: SELECTION_KINDS, example: 'theme' })
  @IsIn(SELECTION_KINDS)
  kind!: SelectionKind;
}

/** Pagination for the users table. */
export class ListUsersQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

// --- responses ---------------------------------------------------------------

export class AdminSummaryDto {
  @ApiProperty({ example: 128 })
  users!: number;

  @ApiProperty({ example: 342 })
  resumes!: number;

  @ApiProperty({ example: 917 })
  downloads!: number;
}

export class DailyCountDto {
  @ApiProperty({ example: '2026-06-27', description: 'UTC day (YYYY-MM-DD).' })
  date!: string;

  @ApiProperty({ example: 42 })
  count!: number;
}

/** One option's tallies within a selection dimension: how many times it was
 *  picked, and how many downloads were rendered with it. */
export class SelectionOptionCountDto {
  @ApiProperty({ example: 'navyGold', description: 'The option id.' })
  value!: string;

  @ApiProperty({ example: 12, description: 'Times the user picked this option.' })
  selections!: number;

  @ApiProperty({ example: 4, description: 'Downloads rendered with this option.' })
  downloads!: number;
}

/** Registration count for one occupation ("unspecified" = null/OAuth signups). */
export class OccupationCountDto {
  @ApiProperty({ example: 'software-engineering' })
  occupation!: string;

  @ApiProperty({ example: 37 })
  count!: number;
}

/** One users-table row. Personal data is limited to what the table shows —
 *  password hashes, refresh tokens and OAuth ids are never selected. */
export class AdminUserRowDto {
  @ApiProperty({ example: '8f0c1d2e-3a4b-5c6d-7e8f-9a0b1c2d3e4f' })
  id!: string;

  @ApiProperty({ example: 'سارا احمدی', nullable: true })
  name!: string | null;

  @ApiProperty({ example: 'sara@example.com' })
  email!: string;

  @ApiProperty({ example: null, nullable: true, description: 'Optional; empty until collected.' })
  phone!: string | null;

  @ApiProperty({
    example: 'software-engineering',
    nullable: true,
    description: 'Occupation id chosen at signup; null for Google/pre-existing accounts.',
  })
  occupation!: string | null;

  @ApiProperty({ example: '2026-06-27T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: 3 })
  resumeCount!: number;
}

export class AdminUsersPageDto {
  @ApiProperty({ example: 128 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ type: AdminUserRowDto, isArray: true })
  users!: AdminUserRowDto[];
}
