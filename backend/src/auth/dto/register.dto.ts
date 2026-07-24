import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { OCCUPATION_IDS, type OccupationId } from '../occupation.constants';

export class RegisterDto {
  @ApiProperty({ example: 'sara@example.com', description: 'Unique account email.' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'S3curePass!',
    minLength: 8,
    description: 'Plain password (hashed server-side with bcrypt).',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'سارا احمدی', required: false, description: 'Display name.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    enum: OCCUPATION_IDS,
    example: 'software-engineering',
    description: 'Self-declared occupation from the fixed list. Optional at signup.',
  })
  @IsOptional()
  @IsIn(OCCUPATION_IDS)
  occupation?: OccupationId;
}
