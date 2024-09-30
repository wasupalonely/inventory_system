// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Sale } from 'src/sales/entities/sale.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
  ) {}

  async getSalesReport(supermarketId: number, startDate: Date, endDate: Date) {
    return this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.supermarketId = :supermarketId', { supermarketId })
      .andWhere('sale.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async generateSalesReportPDF(
    supermarketId: number,
    startDate: Date,
    endDate: Date,
    response: Response,
  ) {
    const sales = await this.getSalesReport(supermarketId, startDate, endDate);

    const doc = new PDFDocument();
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=report_${startDate}_to_${endDate}.pdf`,
    );

    doc.pipe(response);

    // Crear encabezado
    doc
      .fontSize(20)
      .text(`Reporte de Ventas del Supermercado #${supermarketId}`, {
        align: 'center',
      });
    doc.text(`Del ${startDate.toDateString()} al ${endDate.toDateString()}`, {
      align: 'center',
    });
    doc.moveDown();

    // Detallar cada venta
    sales.forEach((sale, index) => {
      doc.fontSize(12).text(`Venta #${index + 1}`);
      doc.text(`Usuario: ${sale.user.id}`);
      doc.text(`Fecha: ${sale.date}`);
      doc.text(`Total: $${sale.total_price}`);
      doc.moveDown();
    });

    doc.end();
  }
}
