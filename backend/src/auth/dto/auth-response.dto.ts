import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: '8f0c1d2e-3a4b-5c6d-7e8f-9a0b1c2d3e4f' })
  id!: string;

  @ApiProperty({ example: 'sara@example.com' })
  email!: string;

  @ApiProperty({ example: 'سارا احمدی', nullable: true })
  name!: string | null;

  @ApiProperty({ description: 'Whether the account has a local password set.', example: true })
  hasPassword!: boolean;

  @ApiProperty({ description: 'Whether a Google account is linked.', example: false })
  googleLinked!: boolean;

  @ApiProperty({ example: '2026-06-27T12:00:00.000Z' })
  createdAt!: string;
}

export class AuthTokensDto {
  @ApiProperty({ description: 'Short-lived JWT access token (Bearer).' })
  accessToken!: string;

  @ApiProperty({ description: 'Long-lived rotating refresh token.' })
  refreshToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserProfileDto })
  user!: UserProfileDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;
}
