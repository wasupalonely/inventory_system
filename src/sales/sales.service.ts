import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { CreateSaleDto } from './dto/sale.dto';
import { Response } from 'express';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private supermarketService: SupermarketService,
  ) {}

  async createSale(createSaleDto: CreateSaleDto) {
    const sale = new Sale();
    sale.user = { id: createSaleDto.userId } as any;
    sale.supermarket = { id: createSaleDto.supermarketId } as Supermarket;

    let totalPrice = 0;
    const saleItems: SaleItem[] = [];

    for (const { productId, quantity } of createSaleDto.productQuantities) {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${productId} no encontrado`,
        );
      }

      const inventory = await this.inventoryRepository.findOne({
        where: {
          product: { id: productId },
          supermarket: { id: createSaleDto.supermarketId },
        },
      });

      if (!inventory || inventory.stock < quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${product.name}`,
        );
      }

      inventory.stock -= quantity;
      await this.inventoryRepository.save(inventory);

      const subtotal = product.price * quantity;
      totalPrice += subtotal;

      const saleItem = new SaleItem();
      saleItem.product = product;
      saleItem.quantity = quantity;
      saleItems.push(saleItem);
    }

    sale.totalPrice = totalPrice;
    sale.saleItems = saleItems;

    await this.saleRepository.save(sale);
    return sale;
  }
  

 async generateInvoicePDF(saleId: number, response: Response) {
  const sale = await this.saleRepository.findOne({
    where: { id: saleId },
    relations: ['saleItems', 'saleItems.product', 'user', 'supermarket'],
  });

  if (!sale) {
    throw new NotFoundException(`Venta con ID ${saleId} no encontrada`);
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a0',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const randomInvoiceNumber = Math.floor(Math.random() * 1000000);

  // Encabezado
  doc.setFont('Courier', 'bold');
  doc.setFontSize(12);
  doc.text('Factura Electrónica de Venta', 75, 10, { align: 'center' });
  doc.setFont('Courier', 'normal');
  doc.text(`No. ${randomInvoiceNumber}`, 75, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('Courier', 'bold');
  doc.text('Carnicería 1', 75, 25, { align: 'center' });
  doc.text('NIT: 1234567890-1', 75, 30, { align: 'center' });
  doc.text('Dirección: Calle 123 #45-67', 75, 35, { align: 'center' });

  // Detalles generales
  const detailsStartY = 45;
  doc.setFont('Courier', 'normal');
  doc.text(`Fecha y Hora: ${moment(sale.date).subtract(5, 'hours').format('DD MMM [del] YYYY')}`, 10, detailsStartY);
  doc.text('Forma de Pago: Contado', 10, detailsStartY + 5);
  doc.text('Medio de Pago: Efectivo', 10, detailsStartY + 10);
  doc.text(`Vendedor: ${sale.user.getFullName()}`, 10, detailsStartY + 15);
  doc.text('Cliente: CONSUMIDOR FINAL', 10, detailsStartY + 20);
  doc.text('Documento: 222222222222', 10, detailsStartY + 25);
  doc.text('Teléfono: 6063301300', 10, detailsStartY + 30);

  // Línea separadora después de los detalles generales
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(10, detailsStartY + 35, 140, detailsStartY + 35);

  // Tabla de productos
  const tableStartY = detailsStartY + 40;
  const tableColumns = [
    { header: 'Producto', dataKey: 'product', width: 50 },
    { header: 'Descripción', dataKey: 'description', width: 50 },
    { header: 'Cant', dataKey: 'quantity', width: 30 },
    { header: 'Precio', dataKey: 'price', width: 30 },
  ];

  const tableRows = sale.saleItems.map((item) => ({
    product: item.product.name,
    description: item.product.description || '-',
    quantity: item.quantity,
    price: formatCurrency(item.product.price),
  }));

  // Generamos la tabla
  (doc as any).autoTable({
    startY: tableStartY,
    columns: tableColumns,
    body: tableRows,
    theme: 'plain',
    styles: { font: 'Courier', fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fontStyle: 'bold' },
    columnStyles: {
      product: { cellWidth: 30, overflow: 'linebreak' },
      description: { cellWidth: 30, overflow: 'linebreak' },
      quantity: { cellWidth: 20 },
      price: { cellWidth: 40 },
    },
    margin: { bottom: 10 }, // Añadimos margen para evitar que el contenido se corte
  });

  const afterTableY = (doc as any).lastAutoTable.finalY;

  // Línea separadora después de la tabla
  doc.line(10, afterTableY + 5, 140, afterTableY + 5);

  // Totales
  doc.text(`Subtotal: ${formatCurrency(sale.totalPrice)}`, 10, afterTableY + 10);
  doc.text('IVA:      $0.00', 10, afterTableY + 15);
  doc.text(`Total:    ${formatCurrency(sale.totalPrice)}`, 10, afterTableY + 20);

  // Línea separadora antes de la información adicional
  doc.line(10, afterTableY + 25, 140, afterTableY + 25);

  // Información adicional
  doc.text('PORTAL WEB PARA FACTURA ELECTRÓNICA EN', 75, afterTableY + 35, { align: 'center' });
  doc.text('https://inventory-frontend-tau-ecru.vercel.app/', 75, afterTableY + 40, { align: 'center' });
  doc.text('GRACIAS POR SU COMPRA', 75, afterTableY + 50, { align: 'center' });
  doc.text('NO SE ACEPTAN DEVOLUCIONES', 75, afterTableY + 55, { align: 'center' });

  // Línea separadora antes de la política de privacidad
  doc.line(10, afterTableY + 60, 140, afterTableY + 60);

  // Política de privacidad
  doc.setFontSize(8);
  const privacyText =
    'La información proporcionada por el cliente será tratada de acuerdo con nuestra política de privacidad. ' +
    'Los datos se utilizarán exclusivamente para la emisión de esta factura y otros fines legales relacionados.';

  doc.text(privacyText, 10, afterTableY + 70, { maxWidth: 130, align: 'justify' });

  // Exportar PDF a la respuesta
  const pdfData = doc.output('arraybuffer');
  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', `attachment; filename=factura_${saleId}.pdf`);
  response.send(Buffer.from(pdfData));
}

  async getSales() {
    return this.saleRepository.find();
  }

  async getSalesBySupermarket(supermarketId: number) {
    const supermarket =
      await this.supermarketService.getSupermarket(supermarketId);

    if (!supermarket) {
      throw new NotFoundException(
        `Supermercado con ID ${supermarketId} no encontrado`,
      );
    }

    const sales = await this.saleRepository.find({
      where: { supermarket: { id: supermarketId } },
      relations: ['saleItems', 'saleItems.product', 'user', 'supermarket'],
    });

    return sales;
  }

  async getMonthlySalesDataBySupermarket(
    supermarketId: number,
  ): Promise<{ thisYear: number[]; lastYear: number[] }> {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .select('EXTRACT(MONTH FROM sale.date)', 'month')
      .addSelect('EXTRACT(YEAR FROM sale.date)', 'year')
      .addSelect('SUM(sale.totalPrice)', 'total')
      .where('sale.supermarketId = :supermarketId', { supermarketId })
      .andWhere(
        'EXTRACT(YEAR FROM sale.date) = :currentYear OR EXTRACT(YEAR FROM sale.date) = :lastYear',
        {
          currentYear,
          lastYear,
        },
      )
      .groupBy('year')
      .addGroupBy('month')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'ASC')
      .getRawMany();

    const thisYearData = Array(12).fill(0);
    const lastYearData = Array(12).fill(0);

    sales.forEach((sale) => {
      const monthIndex = parseInt(sale.month, 10) - 1;
      if (parseInt(sale.year, 10) === currentYear) {
        thisYearData[monthIndex] = parseFloat(sale.total);
      } else if (parseInt(sale.year, 10) === lastYear) {
        lastYearData[monthIndex] = parseFloat(sale.total);
      }
    });

    return { thisYear: thisYearData, lastYear: lastYearData };
  }

  async getTotalEarningsBySupermarket(
    supermarketId: number,
  ): Promise<{ totalEarnings: number; unsoldProductsCost: number }> {
    // Calcula las ganancias de los productos vendidos
    const sales = await this.saleItemRepository.find({
      where: { sale: { supermarket: { id: supermarketId } } },
      relations: ['product', 'sale'],
    });

    const totalEarnings = sales.reduce((total, saleItem) => {
      const unitProfit = saleItem.product.price - saleItem.product.unitCost;
      return total + unitProfit * saleItem.quantity;
    }, 0);

    // Calcula el costo de los productos no vendidos
    const unsoldProducts = await this.inventoryRepository.find({
      where: { supermarket: { id: supermarketId } },
      relations: ['product'],
    });

    const unsoldProductsCost = unsoldProducts.reduce((total, inventoryItem) => {
      return total + inventoryItem.stock * inventoryItem.product.unitCost;
    }, 0);

    return { totalEarnings, unsoldProductsCost };
  }
}
