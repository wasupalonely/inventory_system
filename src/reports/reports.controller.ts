import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-pdf')
  async getSalesReportPDF(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateSalesReportPDF(
      supermarketId,
      start,
      end,
      response,
    );
  }
}
