import { Injectable, NotFoundException } from '@nestjs/common';
import type { PublicResume, ResumeData } from '@resume/types';
import { PrismaService } from '../prisma/prisma.service';
import { resumeInclude, serializeResume } from '../resumes/resume.serializer';

/**
 * Read-only access to a shared resume by its public token. Completely separate
 * from the owner-authenticated resume service: it only ever reads, only resolves
 * tokens whose sharing is enabled, and never exposes mutation.
 */
@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(token: string): Promise<PublicResume> {
    const row = await this.findEnabledByToken(token);
    return {
      resume: serializeResume(row),
      ownerName: row.user.name,
    };
  }

  /** Used by the public PDF route to render a shared resume without auth. */
  async getPublicResumeData(token: string): Promise<ResumeData> {
    const row = await this.findEnabledByToken(token);
    return serializeResume(row);
  }

  private async findEnabledByToken(token: string) {
    const row = await this.prisma.resume.findFirst({
      where: { shareToken: token, shareEnabled: true },
      include: { ...resumeInclude, user: { select: { name: true } } },
    });
    if (!row) {
      throw new NotFoundException('This share link is invalid or has been disabled.');
    }
    return row;
  }
}
