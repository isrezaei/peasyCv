import { Module } from '@nestjs/common';
import { ResumesModule } from '../resumes/resumes.module';
import { ShareModule } from '../share/share.module';
import { MetricsModule } from '../metrics/metrics.module';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';

@Module({
  imports: [ResumesModule, ShareModule, MetricsModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
