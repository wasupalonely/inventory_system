// src/reports/reports.controller.ts
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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

  @Get('most-sold')
  @ApiOperation({ summary: 'Get most sold products' })
  async getMostSoldProducts(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getMostSoldProducts(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('profits')
  @ApiOperation({ summary: 'Get total profits' })
  async getTotalProfits(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getTotalProfits(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('meat-freshness')
  @ApiOperation({ summary: 'Get meat freshness status' })
  async getMeatFreshnessStatus(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getMeatFreshnessStatus(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('products-by-user')
  @ApiOperation({ summary: 'Get products sold by user' })
  async getProductsByUser(
    @Query('supermarketId') supermarketId: number,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getProductsByUser(
      supermarketId,
      userId,
      startDate,
      endDate,
    );
  }

  @Get('least-sold')
  @ApiOperation({ summary: 'Get least sold products' })
  async getLeastSoldProducts(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getLeastSoldProducts(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('products-by-category')
  @ApiOperation({ summary: 'Get products grouped by category' })
  async getProductsByCategory(@Query('supermarketId') supermarketId: number) {
    return this.reportsService.getProductsByCategory(supermarketId);
  }

  @Get('inventory-rotation')
  @ApiOperation({ summary: 'Get inventory rotation metrics' })
  async getInventoryRotation(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getInventoryRotation(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('status-summary')
  @ApiOperation({ summary: 'Get meat quality predictions summary by month' })
  @ApiResponse({
    status: 200,
    description: 'Returns a summary of meat predictions with confidence scores',
  })
  async getMeatStatusSummary(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getMeatStatusSummary(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('analysis')
  @ApiOperation({ summary: 'Get comprehensive meat quality analysis' })
  @ApiResponse({
    status: 200,
    description:
      'Returns detailed analysis of meat quality predictions including confidence scores',
  })
  async getSpoiledMeatAnalysis(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getSpoiledMeatAnalysis(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get meat quality trend over time' })
  @ApiResponse({
    status: 200,
    description:
      'Returns daily trend of meat quality predictions with confidence scores',
  })
  async getMeatQualityTrend(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getMeatQualityTrend(
      supermarketId,
      startDate,
      endDate,
    );
  }

  @Get('critical-stock')
  @ApiOperation({ summary: 'Get products with critical stock levels' })
  async getProductsWithCriticalStock(
    @Query('supermarketId') supermarketId: number,
  ) {
    return this.reportsService.getProductsWithCriticalStock(supermarketId);
  }

  @Post('complete/pdf')
  @ApiOperation({ summary: 'Generate complete report PDF' })
  @ApiResponse({
    status: 200,
    description: 'Returns a PDF file with complete report',
  })
  async generateCompleteReportPDF(
    @Body() filters: ReportFiltersDto,
    @Res() response: Response,
  ) {
    return this.reportsService.generateCompleteReportPDF(filters, response);
  }

  @Get('costs-report')
  async getCostsReport(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getCostsReport(supermarketId, start, end);
  }
}
