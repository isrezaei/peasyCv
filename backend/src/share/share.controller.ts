import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { PublicResume } from '@resume/types';
import { Public } from '../common/decorators/public.decorator';
import { ShareService } from './share.service';
import { PublicResumeDto } from './dto/public-resume.dto';

@ApiTags('share')
@Controller('share')
export class ShareController {
  constructor(private readonly share: ShareService) {}

  @Public()
  @Get(':token')
  @ApiOperation({
    summary: 'Public, unauthenticated, read-only view of a shared resume by token.',
  })
  @ApiParam({ name: 'token', description: 'Public share token.' })
  @ApiOkResponse({ type: PublicResumeDto })
  getPublic(@Param('token') token: string): Promise<PublicResume> {
    return this.share.getPublic(token);
  }
}
