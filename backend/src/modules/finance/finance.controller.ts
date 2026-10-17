import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.financeService.getSummary(from, to);
  }
}
