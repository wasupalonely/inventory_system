// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment';
import { Response } from 'express';
import { Sale } from 'src/sales/entities/sale.entity';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { ReportFiltersDto } from './dto/report-filters.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    private supermarketService: SupermarketService,
  ) {}

  async getSalesReport(filters: ReportFiltersDto) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.user', 'user')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .where('sale.supermarketId = :supermarketId', {
        supermarketId: filters.supermarketId,
      });

    if (filters.userId) {
      query.andWhere('sale.userId = :userId', { userId: filters.userId });
    }

    if (filters.productId) {
      query.andWhere('saleItems.productId = :productId', {
        productId: filters.productId,
      });
    }

    if (filters.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('sale.date BETWEEN :startDate AND :endDate', {
        startDate: moment(filters.startDate).startOf('day').toDate(),
        endDate: moment(filters.endDate).endOf('day').toDate(),
      });
    }

    return query.getMany();
  }

  async generateSalesReportPDF(filters: ReportFiltersDto, response: Response) {
    console.log(
      '🚀 ~ ReportsService ~ generateSalesReportPDF ~ filters:',
      filters,
    );
    const sales = await this.getSalesReport(filters);
    const supermarket = await this.supermarketService.getSupermarket(
      filters.supermarketId,
    );

    const doc = new PDFDocument({ margin: 50 });
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=report_${filters.startDate ? moment(filters.startDate).format('YYYY-MM-DD') : 'all'}_to_${filters.endDate ? moment(filters.endDate).format('YYYY-MM-DD') : 'all'}.pdf`,
    );

    doc.pipe(response);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`Reporte de Ventas del Supermercado "${supermarket.name}"`, {
        align: 'center',
      });

    if (filters.startDate && filters.endDate) {
      doc
        .fontSize(14)
        .font('Helvetica')
        .text(
          `Del ${moment(filters.startDate).format('DD/MM/YYYY')} al ${moment(filters.endDate).format('DD/MM/YYYY')}`,
          { align: 'center' },
        );
    } else {
      doc
        .fontSize(14)
        .font('Helvetica')
        .text('Reporte general (sin rango de fechas)', { align: 'center' });
    }
    doc.moveDown(2);

    if (sales.length === 0) {
      doc
        .fontSize(14)
        .text(
          'No se encontraron ventas en el rango de fechas o filtros proporcionados.',
          {
            align: 'center',
          },
        );
      doc.end();
      return;
    }

    sales.forEach((sale, index) => {
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`Venta #${index + 1}`);
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Usuario: ${sale.user.getFullName()}`);
      doc.text(`Fecha: ${moment(sale.date).format('DD/MM/YYYY HH:mm:ss')}`);
      doc.text(`Total: $${sale.totalPrice}`);
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Productos vendidos:');
      sale.saleItems.forEach((item) => {
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(
            `- ${item.product.name}: ${item.quantity} unidades a $${item.product.price} cada una`,
          );
      });

      doc.moveDown(1);
      doc
        .strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(1);
    });

    doc.end();
  }
}
