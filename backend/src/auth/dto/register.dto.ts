import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
}
