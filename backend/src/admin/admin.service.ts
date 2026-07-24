import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SELECTION_DOWNLOAD_COLUMN,
  type SelectionKind,
} from '../metrics/selection.constants';
import {
  AdminSummaryDto,
  AdminUsersPageDto,
  DailyCountDto,
  OccupationCountDto,
  SelectionOptionCountDto,
} from './dto/admin.dto';

/** Read-side of the admin dashboard: totals, daily series, users table. */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(): Promise<AdminSummaryDto> {
    const [users, resumes, downloads] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.resume.count(),
      this.prisma.downloadEvent.count(),
    ]);
    return { users, resumes, downloads };
  }

  /** Unique visitors per UTC day (the [visitorId, date] constraint dedups). */
  async visitsByDay(from?: string, to?: string): Promise<DailyCountDto[]> {
    const rows = await this.prisma.visitEvent.groupBy({
      by: ['date'],
      _count: { _all: true },
      where: dayRange(from, to),
      orderBy: { date: 'asc' },
    });
    return rows.map((row) => ({ date: row.date, count: row._count._all }));
  }

  async downloadsByDay(from?: string, to?: string): Promise<DailyCountDto[]> {
    const rows = await this.prisma.downloadEvent.groupBy({
      by: ['date'],
      _count: { _all: true },
      where: dayRange(from, to),
      orderBy: { date: 'asc' },
    });
    return rows.map((row) => ({ date: row.date, count: row._count._all }));
  }

  /**
   * For one selection dimension, each option's tallies over the range: how many
   * times it was picked (SelectionEvent) and how many downloads used it (the
   * matching DownloadEvent snapshot column). Merged on `value`, sorted by total
   * desc so the caller can show a top-N — the frontend never renders all 25
   * theme rows. Both counts share the same from/to day range.
   */
  async selectionsByOption(
    kind: SelectionKind,
    from?: string,
    to?: string,
  ): Promise<SelectionOptionCountDto[]> {
    const column = SELECTION_DOWNLOAD_COLUMN[kind];
    const downloadWhere: Prisma.DownloadEventWhereInput = {
      [column]: { not: null },
      ...dayRange(from, to),
    };
    const [selections, downloads] = await this.prisma.$transaction([
      this.prisma.selectionEvent.groupBy({
        by: ['value'],
        _count: { _all: true },
        where: { kind, ...dayRange(from, to) },
        orderBy: { value: 'asc' },
      }),
      this.prisma.downloadEvent.groupBy({
        by: [column as Prisma.DownloadEventScalarFieldEnum],
        _count: { _all: true },
        where: downloadWhere,
        orderBy: { [column]: 'asc' } as Prisma.DownloadEventOrderByWithAggregationInput,
      }),
    ]);

    const tally = new Map<string, { selections: number; downloads: number }>();
    const bucket = (value: string) => {
      let entry = tally.get(value);
      if (!entry) {
        entry = { selections: 0, downloads: 0 };
        tally.set(value, entry);
      }
      return entry;
    };
    // The $transaction tuple widens each groupBy's precise `_count` type, so
    // read `_count._all` through a narrow cast (both series share the shape).
    for (const row of selections) {
      bucket(row.value).selections = (row._count as { _all: number })._all;
    }
    for (const row of downloads) {
      const rec = row as Record<string, unknown> & { _count: { _all: number } };
      const value = rec[column];
      if (typeof value === 'string') bucket(value).downloads = rec._count._all;
    }

    return [...tally.entries()]
      .map(([value, counts]) => ({ value, ...counts }))
      .sort((a, b) => b.selections + b.downloads - (a.selections + a.downloads));
  }

  /** Registrations grouped by occupation; null → "unspecified". Sorted desc. */
  async occupationBreakdown(): Promise<OccupationCountDto[]> {
    const rows = await this.prisma.user.groupBy({
      by: ['occupation'],
      _count: { _all: true },
    });
    return rows
      .map((row) => ({ occupation: row.occupation ?? 'unspecified', count: row._count._all }))
      .sort((a, b) => b.count - a.count);
  }

  async listUsers(page: number, pageSize: number): Promise<AdminUsersPageDto> {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        // Personal data: select ONLY what the table shows. passwordHash,
        // hashedRefreshToken and googleId must never leave the database here.
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          occupation: true,
          createdAt: true,
          _count: { select: { resumes: true } },
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      users: rows.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        occupation: user.occupation,
        createdAt: user.createdAt.toISOString(),
        resumeCount: user._count.resumes,
      })),
    };
  }
}

function dayRange(from?: string, to?: string): { date?: { gte?: string; lte?: string } } {
  if (!from && !to) return {};
  return { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } };
}
