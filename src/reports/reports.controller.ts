import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import * as moment from 'moment';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

@ApiTags('Reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-pdf')
  @ApiResponse({
    status: 200,
    description: 'Generate sales report in PDF format',
  })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  async getSalesReportPDF(
    @Query('supermarketId') supermarketId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    try {
      const start = moment(startDate, 'YYYY-MM-DD');
      const end = moment(endDate, 'YYYY-MM-DD').endOf('day');

      if (!start.isValid() || !end.isValid()) {
        throw new BadRequestException('Invalid date format');
      }

      const startDateFormatted = start.toDate();
      const endDateFormatted = end.toDate();

      return this.reportsService.generateSalesReportPDF(
        supermarketId,
        startDateFormatted,
        endDateFormatted,
        response,
      );
    } catch (error) {
      response.status(400).send({
        message: 'Invalid date format or other error',
        error: error.message,
      });
    }
  }
}
