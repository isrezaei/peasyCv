import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isValidSelection, type SelectionKind } from './selection.constants';

/** Selection snapshot captured server-side from the résumé being rendered. */
export interface DownloadSnapshot {
  templateId: string | null;
  themeId: string | null;
  backgroundPattern: string | null;
  fontId: string | null;
}

/**
 * Writes the admin-dashboard event streams:
 *  - visits: one row per unique visitor per UTC day. The [visitorId, date]
 *    unique constraint is the dedup, so the daily count is exact without any
 *    read-then-write race.
 *  - downloads: one row per successful server-side PDF render, recorded by the
 *    PDF controller (never client-side, where it could be spoofed or missed).
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** UTC day bucket, e.g. "2026-07-13". */
  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async recordVisit(visitorId: string): Promise<void> {
    try {
      await this.prisma.visitEvent.create({ data: { visitorId, date: this.today() } });
    } catch (error) {
      // P2002 (unique violation) = this visitor was already counted today.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return;
      }
      throw error;
    }
  }

  /**
   * Records a design selection when the user actually changes a setting. The
   * value is validated against the kind's allowed set — unknown ids are dropped,
   * not stored. Log-and-swallow: a metrics failure must never break the editor.
   */
  async recordSelection(kind: SelectionKind, value: string): Promise<void> {
    if (!isValidSelection(kind, value)) return;
    try {
      await this.prisma.selectionEvent.create({
        data: { kind, value, date: this.today() },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to record selection event: ${message}`);
    }
  }

  /**
   * Fire-and-forget by design: a metrics failure must never break a download,
   * so errors are logged and swallowed here. The selection snapshot is taken
   * server-side from the résumé being rendered (never client-supplied).
   */
  async recordDownload(input: {
    userId: string | null;
    resumeId: string | null;
    source: 'editor' | 'share';
    snapshot: DownloadSnapshot;
  }): Promise<void> {
    const { snapshot, ...rest } = input;
    try {
      await this.prisma.downloadEvent.create({
        data: { ...rest, ...snapshot, date: this.today() },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to record download event: ${message}`);
    }
  }
}
