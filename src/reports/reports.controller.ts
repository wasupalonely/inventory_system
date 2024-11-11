// src/reports/reports.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-pdf')
  @ApiResponse({
    status: 200,
    description: 'Reporte de ventas en PDF',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al generar el reporte de ventas',
  })
  async getSalesReportPDF(
    @Query() filters: ReportFiltersDto,
    @Res() response: Response,
  ) {
    return this.reportsService.generateSalesReportPDF(filters, response);
  }
}
