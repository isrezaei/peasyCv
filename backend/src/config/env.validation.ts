import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

/**
 * Validates the subset of environment variables the app cannot run without, and
 * fails fast (at boot) with a clear message if any are missing/invalid. Optional
 * feature credentials (Google, S3, Cloudinary) are intentionally NOT required
 * here — they are validated lazily by the feature that needs them so the app can
 * boot for local development without them.
 */
class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  PORT?: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(8, { message: 'JWT_ACCESS_SECRET must be at least 8 characters' })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(8, { message: 'JWT_REFRESH_SECRET must be at least 8 characters' })
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsIn(['local', 's3', 'cloudinary'])
  STORAGE_PROVIDER?: string;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(`Invalid environment configuration:\n  - ${details}`);
  }

  return config;
}
