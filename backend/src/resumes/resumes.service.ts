import { randomBytes } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ResumeData, TemplateId } from '@resume/types';
import type { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeSummaryDto, ShareLinkDto } from './dto/resume-summary.dto';
import { createDefaultResumeData } from './resume-default.factory';
import { resumeInclude, serializeResume } from './resume.serializer';
import { writeResumeData } from './resume-writer';

@Injectable()
export class ResumesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // --- Reads ---------------------------------------------------------------

  async list(userId: string): Promise<ResumeSummaryDto[]> {
    const rows = await this.prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, templateId: true, createdAt: true, updatedAt: true },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      templateId: r.templateId as TemplateId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /** The user's most recently updated resume (or null) — backs the frontend's
   *  single-document repository `get()`. */
  async getCurrent(userId: string): Promise<ResumeData | null> {
    const row = await this.prisma.resume.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: resumeInclude,
    });
    return row ? serializeResume(row) : null;
  }

  async getOne(userId: string, id: string): Promise<ResumeData> {
    const row = await this.prisma.resume.findUnique({ where: { id }, include: resumeInclude });
    // Hide existence of resumes the caller does not own.
    if (!row || row.userId !== userId) {
      throw new NotFoundException('Resume not found.');
    }
    return serializeResume(row);
  }

  // --- Writes --------------------------------------------------------------

  async create(userId: string, dto: CreateResumeDto): Promise<ResumeData> {
    const data = createDefaultResumeData(dto);
    return this.persist(userId, data.id, data, 'create');
  }

  /**
   * Upsert by id (replace whole ResumeData). Backs the frontend autosave PUT:
   * creates the resume on first save, fully replaces it thereafter. Ownership is
   * enforced — a resume id already owned by someone else cannot be hijacked.
   */
  async upsert(userId: string, id: string, payload: ResumeData): Promise<ResumeData> {
    const existing = await this.prisma.resume.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (existing && existing.userId !== userId) {
      throw new ForbiddenException('You do not have access to this resume.');
    }
    return this.persist(userId, id, { ...payload, id }, existing ? 'replace' : 'create');
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwned(userId, id);
    await this.prisma.resume.delete({ where: { id } });
  }

  // --- Sharing -------------------------------------------------------------

  async enableShare(userId: string, id: string): Promise<ShareLinkDto> {
    await this.assertOwned(userId, id);
    const existing = await this.prisma.resume.findUnique({
      where: { id },
      select: { shareToken: true },
    });
    const token = existing?.shareToken ?? randomBytes(16).toString('hex');
    await this.prisma.resume.update({
      where: { id },
      data: { shareToken: token, shareEnabled: true },
    });
    return { token, url: this.buildShareUrl(token), enabled: true };
  }

  async disableShare(userId: string, id: string): Promise<void> {
    await this.assertOwned(userId, id);
    await this.prisma.resume.update({ where: { id }, data: { shareEnabled: false } });
  }

  async getShareStatus(userId: string, id: string): Promise<ShareLinkDto> {
    await this.assertOwned(userId, id);
    const row = await this.prisma.resume.findUnique({
      where: { id },
      select: { shareToken: true, shareEnabled: true },
    });
    const token = row?.shareToken ?? '';
    return {
      token,
      url: token ? this.buildShareUrl(token) : '',
      enabled: Boolean(row?.shareEnabled),
    };
  }

  // --- internals -----------------------------------------------------------

  private buildShareUrl(token: string): string {
    return `${this.config.get('frontendUrl', { infer: true })}/share/${token}`;
  }

  private async assertOwned(userId: string, id: string): Promise<void> {
    const row = await this.prisma.resume.findUnique({ where: { id }, select: { userId: true } });
    if (!row || row.userId !== userId) {
      throw new NotFoundException('Resume not found.');
    }
  }

  /**
   * Full write of a ResumeData payload in a single transaction. The replace path
   * clears and recreates every child collection so the DB exactly mirrors the
   * payload (no stale rows) — simple and correct for resume-sized documents.
   */
  private async persist(
    userId: string,
    id: string,
    payload: ResumeData,
    mode: 'create' | 'replace',
  ): Promise<ResumeData> {
    const row = await this.prisma.$transaction(async (tx) => {
      await writeResumeData(tx, userId, id, payload, mode);
      return tx.resume.findUniqueOrThrow({ where: { id }, include: resumeInclude });
    });

    return serializeResume(row);
  }
}
