import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

/** Body for the public POST /visits beacon. */
export class RecordVisitDto {
  @ApiProperty({
    example: '8f0c1d2e-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
    description:
      'Opaque anonymous visitor id minted client-side (random UUID in localStorage). ' +
      'Not personal data: no IP, no user agent, never joined to an account.',
  })
  @IsString()
  @Length(8, 64)
  @Matches(/^[A-Za-z0-9-]+$/)
  visitorId!: string;
}
