import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { ResumeData } from '@resume/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService, type DownloadSnapshot } from '../metrics/metrics.service';
import { ResumeDataDto } from '../resumes/dto/resume-data.dto';
import { ResumesService } from '../resumes/resumes.service';
import { ShareService } from '../share/share.service';
import { PdfService } from './pdf.service';

@ApiTags('pdf')
@ApiProduces('application/pdf')
@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdf: PdfService,
    private readonly resumes: ResumesService,
    private readonly share: ShareService,
    private readonly metrics: MetricsService,
  ) {}

  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Render the supplied resume to an A4 PDF (matches the live editor preview).',
  })
  @ApiOkResponse({ description: 'The generated PDF.', content: { 'application/pdf': {} } })
  async renderFromBody(
    @CurrentUser('id') userId: string,
    @Body() resume: ResumeDataDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.pdf.renderResumePdf(resume as ResumeData);
    // Recorded server-side, only after a successful render (never client-side).
    await this.metrics.recordDownload({
      userId,
      resumeId: resume.id ?? null,
      source: 'editor',
      snapshot: snapshotOf(resume as ResumeData),
    });
    this.send(res, buffer, resume.title);
  }

  @ApiBearerAuth('access-token')
  @Get('resume/:id')
  @ApiOperation({ summary: "Render the owner's stored resume to a PDF." })
  @ApiParam({ name: 'id', description: 'Resume id (UUID).' })
  async renderOwned(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const resume = await this.resumes.getOne(userId, id);
    const buffer = await this.pdf.renderResumePdf(resume);
    await this.metrics.recordDownload({
      userId,
      resumeId: id,
      source: 'editor',
      snapshot: snapshotOf(resume),
    });
    this.send(res, buffer, resume.title);
  }

  @Public()
  @Get('share/:token')
  @ApiOperation({ summary: 'Render a publicly-shared resume to a PDF (no auth).' })
  @ApiParam({ name: 'token', description: 'Public share token.' })
  async renderShared(@Param('token') token: string, @Res() res: Response): Promise<void> {
    const resume = await this.share.getPublicResumeData(token);
    const buffer = await this.pdf.renderResumePdf(resume);
    // Anonymous by design: share downloads have no requesting user.
    await this.metrics.recordDownload({
      userId: null,
      resumeId: resume.id,
      source: 'share',
      snapshot: snapshotOf(resume),
    });
    this.send(res, buffer, resume.title);
  }

  private send(res: Response, buffer: Buffer, title: string): void {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition(title),
      'Content-Length': String(buffer.byteLength),
      'Cache-Control': 'no-store',
    });
    res.end(buffer);
  }
}

/**
 * The design selection in effect on the résumé being rendered. Read server-side
 * here (never trusted from a client field) so "downloads per option" reflects
 * what was actually exported.
 */
function snapshotOf(resume: ResumeData): DownloadSnapshot {
  return {
    templateId: resume.templateId,
    themeId: resume.theme.themeId,
    backgroundPattern: resume.theme.backgroundPattern,
    fontId: resume.theme.fontFamily,
  };
}

/** RFC 5987 disposition with an ASCII fallback + UTF-8 (Persian) filename. */
function contentDisposition(title: string): string {
  const base = (title ?? '').trim() || 'resume';
  const encoded = encodeURIComponent(`${base}.pdf`);
  return `attachment; filename="resume.pdf"; filename*=UTF-8''${encoded}`;
}
