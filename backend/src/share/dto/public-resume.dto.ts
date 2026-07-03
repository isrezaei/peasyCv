import { ApiProperty } from '@nestjs/swagger';
import type { PublicResume } from '@resume/types';
import { ResumeDataDto } from '../../resumes/dto/resume-data.dto';

/** Read-only payload returned by the public share endpoint. */
export class PublicResumeDto implements PublicResume {
  @ApiProperty({ type: ResumeDataDto, description: 'The renderable resume data (read-only).' })
  resume!: ResumeDataDto;

  @ApiProperty({ example: 'سارا احمدی', nullable: true, description: "Resume owner's display name." })
  ownerName!: string | null;
}
