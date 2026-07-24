import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';
import { RecordSelectionDto } from './dto/record-selection.dto';

@ApiTags('metrics')
@Controller('selections')
export class SelectionsController {
  constructor(private readonly metrics: MetricsService) {}

  // Public on purpose: most design exploration happens before login, so guests
  // must be counted too. The DTO constrains kind/value and the service drops any
  // value outside the kind's allowed set. Anonymous: no user id, no IP recorded.
  @Public()
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Design-selection beacon (kind + chosen option id, anonymous).' })
  @ApiNoContentResponse()
  async record(@Body() dto: RecordSelectionDto): Promise<void> {
    await this.metrics.recordSelection(dto.kind, dto.value);
  }
}
