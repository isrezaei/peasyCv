import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { VisitsController } from './visits.controller';
import { SelectionsController } from './selections.controller';

/**
 * Event capture for the admin dashboard: the public visit beacon and the
 * download recorder (used by PdfModule). Reading/aggregating the events is
 * AdminModule's job.
 */
@Module({
  controllers: [VisitsController, SelectionsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
