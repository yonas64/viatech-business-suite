import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('daily')
  getDailyReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getDailyReport(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('weekly')
  getWeeklyReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getWeeklyReport(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('monthly')
  getMonthlyReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getMonthlyReport(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary(@Query() query: ReportQueryDto) {
    return this.reportsService.getSummary(query);
  }
}
