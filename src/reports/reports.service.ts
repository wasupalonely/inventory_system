// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment'; // Importar moment para formateo de fechas
import { Response } from 'express';
import { Sale } from 'src/sales/entities/sale.entity';
import { SupermarketService } from 'src/supermarket/supermarket.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    private supermarketService: SupermarketService,
  ) {}

  async getSalesReport(supermarketId: number, startDate: Date, endDate: Date) {
    return this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.user', 'user')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
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
    const supermarket =
      await this.supermarketService.getSupermarket(supermarketId);

    const doc = new PDFDocument({ margin: 50 });
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=report_${moment(startDate).format('YYYY-MM-DD')}_to_${moment(endDate).format('YYYY-MM-DD')}.pdf`,
    );

    doc.pipe(response);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`Reporte de Ventas del Supermercado "${supermarket.name}"`, {
        align: 'center',
      });
    doc
      .fontSize(14)
      .font('Helvetica')
      .text(
        `Del ${moment(startDate).format('DD/MM/YYYY')} al ${moment(endDate).format('DD/MM/YYYY')}`,
        {
          align: 'center',
        },
      );
    doc.moveDown(2);

    if (sales.length === 0) {
      doc
        .fontSize(14)
        .text('No se encontraron ventas en el rango de fechas proporcionado.', {
          align: 'center',
        });
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
