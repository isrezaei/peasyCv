import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { ResumeData } from '@resume/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeDataDto } from './dto/resume-data.dto';
import { ResumeSummaryDto, ShareLinkDto } from './dto/resume-summary.dto';

@ApiTags('resumes')
@ApiBearerAuth('access-token')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumes: ResumesService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated user's resumes (newest first)." })
  @ApiOkResponse({ type: ResumeSummaryDto, isArray: true })
  list(@CurrentUser('id') userId: string): Promise<ResumeSummaryDto[]> {
    return this.resumes.list(userId);
  }

  // NOTE: declared before :id so it is not captured by the param route.
  @Get('current')
  @ApiOperation({
    summary: "The user's most recently updated resume (or null). Backs frontend autoload.",
  })
  @ApiOkResponse({ type: ResumeDataDto })
  getCurrent(@CurrentUser('id') userId: string): Promise<ResumeData | null> {
    return this.resumes.getCurrent(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new resume seeded with defaults (optional overrides).' })
  @ApiOkResponse({ type: ResumeDataDto })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateResumeDto,
  ): Promise<ResumeData> {
    return this.resumes.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one full resume (owner only).' })
  @ApiParam({ name: 'id', description: 'Resume id (UUID).' })
  @ApiOkResponse({ type: ResumeDataDto })
  getOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<ResumeData> {
    return this.resumes.getOne(userId, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Create or fully replace a resume by id. Persists the entire ResumeData.',
  })
  @ApiParam({ name: 'id', description: 'Resume id (UUID); created if it does not exist.' })
  @ApiOkResponse({ type: ResumeDataDto })
  upsert(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: ResumeDataDto,
  ): Promise<ResumeData> {
    return this.resumes.upsert(userId, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resume (owner only).' })
  @ApiNoContentResponse()
  remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.resumes.remove(userId, id);
  }

  // --- Sharing controls ----------------------------------------------------

  @Get(':id/share')
  @ApiOperation({ summary: 'Get the current public-share status/link for a resume.' })
  @ApiOkResponse({ type: ShareLinkDto })
  getShare(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<ShareLinkDto> {
    return this.resumes.getShareStatus(userId, id);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Enable public sharing and return the read-only link.' })
  @ApiOkResponse({ type: ShareLinkDto })
  enableShare(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<ShareLinkDto> {
    return this.resumes.enableShare(userId, id);
  }

  @Delete(':id/share')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disable public sharing (the link stops resolving).' })
  @ApiNoContentResponse()
  disableShare(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.resumes.disableShare(userId, id);
  }
}
