import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import {
  AdminSummaryDto,
  AdminUsersPageDto,
  DailyCountDto,
  DateRangeQueryDto,
  ListUsersQueryDto,
  OccupationCountDto,
  SelectionOptionCountDto,
  SelectionQueryDto,
} from './dto/admin.dto';

/**
 * Admin-only endpoints. The class-level {@link AdminGuard} (a fresh isAdmin DB
 * read per request, on top of the global JWT guard) is the security boundary —
 * the frontend /admin gate is UX only. Every access is logged with the acting
 * admin's id; the users endpoint returns only the fields the table shows.
 */
@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly admin: AdminService) {}

  @Get('stats/summary')
  @ApiOperation({ summary: 'Totals: registered users, resumes, downloads.' })
  @ApiOkResponse({ type: AdminSummaryDto })
  summary(@CurrentUser('id') adminId: string): Promise<AdminSummaryDto> {
    this.logger.log(`admin=${adminId} GET /admin/stats/summary`);
    return this.admin.summary();
  }

  @Get('stats/visits')
  @ApiOperation({ summary: 'Unique visitors per UTC day (anonymous cookie-id based).' })
  @ApiOkResponse({ type: DailyCountDto, isArray: true })
  visits(
    @CurrentUser('id') adminId: string,
    @Query() query: DateRangeQueryDto,
  ): Promise<DailyCountDto[]> {
    this.logger.log(`admin=${adminId} GET /admin/stats/visits from=${query.from ?? ''} to=${query.to ?? ''}`);
    return this.admin.visitsByDay(query.from, query.to);
  }

  @Get('stats/downloads')
  @ApiOperation({ summary: 'PDF downloads per UTC day (recorded server-side at render).' })
  @ApiOkResponse({ type: DailyCountDto, isArray: true })
  downloads(
    @CurrentUser('id') adminId: string,
    @Query() query: DateRangeQueryDto,
  ): Promise<DailyCountDto[]> {
    this.logger.log(`admin=${adminId} GET /admin/stats/downloads from=${query.from ?? ''} to=${query.to ?? ''}`);
    return this.admin.downloadsByDay(query.from, query.to);
  }

  @Get('stats/selections')
  @ApiOperation({
    summary:
      'Per-option tallies for one design dimension (kind): times selected + downloads that used it.',
  })
  @ApiOkResponse({ type: SelectionOptionCountDto, isArray: true })
  selections(
    @CurrentUser('id') adminId: string,
    @Query() query: SelectionQueryDto,
  ): Promise<SelectionOptionCountDto[]> {
    this.logger.log(
      `admin=${adminId} GET /admin/stats/selections kind=${query.kind} from=${query.from ?? ''} to=${query.to ?? ''}`,
    );
    return this.admin.selectionsByOption(query.kind, query.from, query.to);
  }

  @Get('stats/occupations')
  @ApiOperation({ summary: 'Registrations grouped by occupation (null → "unspecified").' })
  @ApiOkResponse({ type: OccupationCountDto, isArray: true })
  occupations(@CurrentUser('id') adminId: string): Promise<OccupationCountDto[]> {
    this.logger.log(`admin=${adminId} GET /admin/stats/occupations`);
    return this.admin.occupationBreakdown();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Paginated users table: name, email, phone (optional), signup date, resume count.',
  })
  @ApiOkResponse({ type: AdminUsersPageDto })
  users(
    @CurrentUser('id') adminId: string,
    @Query() query: ListUsersQueryDto,
  ): Promise<AdminUsersPageDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    // Access to personal data is always logged (spec: log admin access).
    this.logger.log(`admin=${adminId} GET /admin/users page=${page} pageSize=${pageSize}`);
    return this.admin.listUsers(page, pageSize);
  }
}
