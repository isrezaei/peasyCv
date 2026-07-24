import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';
import { RecordVisitDto } from './dto/record-visit.dto';

@ApiTags('metrics')
@Controller('visits')
export class VisitsController {
  constructor(private readonly metrics: MetricsService) {}

  // Public on purpose: guests are exactly who the visitor stats must count.
  // The DTO constrains the id shape and the DB unique constraint caps the
  // write volume at one row per visitor per day.
  @Public()
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Daily visit beacon (anonymous visitor id, deduped per UTC day).' })
  @ApiNoContentResponse()
  async record(@Body() dto: RecordVisitDto): Promise<void> {
    await this.metrics.recordVisit(dto.visitorId);
  }
}
