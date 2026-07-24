import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Length, Matches } from 'class-validator';
import { SELECTION_KINDS, type SelectionKind } from '../selection.constants';

/** Body for the public POST /selections beacon. */
export class RecordSelectionDto {
  @ApiProperty({
    enum: SELECTION_KINDS,
    example: 'theme',
    description: 'Which design dimension was changed.',
  })
  @IsIn(SELECTION_KINDS)
  kind!: SelectionKind;

  @ApiProperty({
    example: 'navyGold',
    description:
      'The chosen option id (e.g. a themeId / templateId). Validated against the ' +
      'kind\'s allowed set server-side; unknown values are silently ignored.',
  })
  @IsString()
  @Length(1, 64)
  @Matches(/^[A-Za-z0-9-]+$/)
  value!: string;
}
