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
  ) {}

  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Render the supplied resume to an A4 PDF (matches the live editor preview).',
  })
  @ApiOkResponse({ description: 'The generated PDF.', content: { 'application/pdf': {} } })
  async renderFromBody(@Body() resume: ResumeDataDto, @Res() res: Response): Promise<void> {
    const buffer = await this.pdf.renderResumePdf(resume as ResumeData);
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
    this.send(res, buffer, resume.title);
  }

  @Public()
  @Get('share/:token')
  @ApiOperation({ summary: 'Render a publicly-shared resume to a PDF (no auth).' })
  @ApiParam({ name: 'token', description: 'Public share token.' })
  async renderShared(@Param('token') token: string, @Res() res: Response): Promise<void> {
    const resume = await this.share.getPublicResumeData(token);
    const buffer = await this.pdf.renderResumePdf(resume);
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

/** RFC 5987 disposition with an ASCII fallback + UTF-8 (Persian) filename. */
function contentDisposition(title: string): string {
  const base = (title ?? '').trim() || 'resume';
  const encoded = encodeURIComponent(`${base}.pdf`);
  return `attachment; filename="resume.pdf"; filename*=UTF-8''${encoded}`;
}
