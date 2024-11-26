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
import { createHash } from 'crypto';

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

  generarCUFE(
    numFac: string,
    fecFac: string,
    valFac: string,
    nit: string,
  ): string {
    // Valores "quemados"
    const codImp1 = '01';
    const valImp1 = '0.00';
    const codImp2 = '02';
    const valImp2 = '0.00';
    const codImp3 = '03';
    const valImp3 = '0.00';
    const tipAdq = '31';
    const numAdq = '123456789';
    const clTec = 'clave_tecnica_ficticia';

    // Concatenar valores para el cálculo del CUFE
    const cadenaCUFE = `${numFac}${fecFac}${valFac}${codImp1}${valImp1}${codImp2}${valImp2}${codImp3}${valImp3}${nit}${tipAdq}${numAdq}${clTec}`;

    // Generar CUFE usando SHA-1
    const cufe = createHash('sha1')
      .update(cadenaCUFE)
      .digest('hex')
      .toUpperCase();

    return cufe;
  }

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
      relations: [
        'saleItems',
        'saleItems.product',
        'user',
        'supermarket.address',
      ],
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${saleId} no encontrada`);
    }

    const { supermarket } = sale;
    const {
      name: companyName,
      socialReason,
      nit: companyNIT,
      address,
    } = supermarket;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Formateo de moneda
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const responseInvoiceNumber =
      await this.supermarketService.generateInvoiceNumber(supermarket.id);

    const invoiceNumber = this.formatInvoiceNumber(responseInvoiceNumber);

    // Encabezado
    doc.setFont('Courier', 'bold');
    doc.setFontSize(10);
    doc.text('Factura Electrónica de Venta', 105, 15, { align: 'center' });
    doc.text(`No. ${invoiceNumber}`, 105, 20, { align: 'center' });

    // Información del supermercado
    doc.text(companyName || 'Supermercado', 10, 30);
    doc.text(`Razón Social: ${socialReason || 'N/A'}`, 10, 35);
    doc.text(`NIT: ${companyNIT || 'N/A'}`, 10, 40);
    doc.text(
      `Dirección: ${address?.getAddressStringFormatted() || 'N/A'}`,
      10,
      45,
    );

    const CUFE = this.generarCUFE(
      invoiceNumber.toString(),
      moment().format('YYYYMMDD'),
      sale.totalPrice.toString(),
      supermarket.nit,
    );
    doc.text(`CUFE: ${CUFE}`, 105, 25, { align: 'center' });

    // Detalles generales de la factura
    const detailsStartY = 55;
    doc.setFont('Courier', 'normal');
    doc.text(
      `Fecha y Hora: ${moment().format('DD MMM [del] YYYY HH:mm')}`,
      10,
      detailsStartY,
    );
    doc.text('Forma de Pago: Contado', 10, detailsStartY + 5);
    doc.text('Medio de Pago: Efectivo', 10, detailsStartY + 10);
    doc.text(
      `Vendedor: ${sale.user?.getFullName() || 'Consumidor Final'}`,
      10,
      detailsStartY + 15,
    );

    // Línea separadora
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, detailsStartY + 35, 200, detailsStartY + 35);

    // Tabla de productos
    const tableColumns = [
      { header: 'Producto', dataKey: 'product' },
      { header: 'Descripción', dataKey: 'description' },
      { header: 'Precio x Unidad', dataKey: 'pricePerUnit' },
      { header: 'Precio x Gramo', dataKey: 'pricePerPound' },
      { header: 'Cantidad', dataKey: 'quantity' },
      { header: 'Subtotal', dataKey: 'subtotal' },
    ];

    const tableRows = sale.saleItems.map((item) => ({
      product: `${item.product.name} ${item.product.weight} gr`,
      description: item.product.description || 'N/A',
      pricePerUnit: formatCurrency(item.product.price),
      quantity: item.quantity,
      pricePerPound: item.product.pricePerPound,
      subtotal: formatCurrency(item.product.price * item.quantity),
    }));

    (doc as any).autoTable({
      startY: 70,
      columns: tableColumns,
      body: tableRows,
      theme: 'plain',
      styles: { font: 'Courier', fontSize: 10, cellPadding: 2 },
      headStyles: { fontStyle: 'bold' },
      columnStyles: {
        product: { cellWidth: 30 },
        description: { cellWidth: 40 },
        pricePerGram: { cellWidth: 30 }, // Definir ancho para la nueva columna
        pricePerUnit: { cellWidth: 30 },
        quantity: { cellWidth: 20 },
        subtotal: { cellWidth: 40 },
      },
    });

    const afterTableY = (doc as any).lastAutoTable.finalY;

    // Totales
    const subtotal = sale.totalPrice;
    const iva = 0; // IVA (puedes calcular dinámicamente si es necesario)
    const total = subtotal + iva;

    doc.text(
      `                                                                Subtotal: ${formatCurrency(subtotal)}`,
      10,
      afterTableY + 10,
    ); // Subtotal
    doc.text(
      `                                                                     IVA: ${formatCurrency(iva)}`,
      10,
      afterTableY + 15,
    ); // IVA (quemado)
    doc.text(
      `                                                                   Total: ${formatCurrency(total)}`,
      10,
      afterTableY + 20,
    ); // Total

    // Línea separadora
    doc.line(10, afterTableY + 25, 200, afterTableY + 25);

    // Información adicional
    doc.text('PORTAL WEB PARA FACTURA ELECTRÓNICA EN', 110, afterTableY + 35, {
      align: 'center',
    });
    doc.text(
      'https://inventory-frontend-tau-ecru.vercel.app/',
      110,
      afterTableY + 40,
      { align: 'center' },
    );
    doc.text('GRACIAS POR SU COMPRA', 110, afterTableY + 50, {
      align: 'center',
    });
    doc.text('NO SE ACEPTAN DEVOLUCIONES', 110, afterTableY + 55, {
      align: 'center',
    });

    doc.line(10, afterTableY + 60, 200, afterTableY + 60);

    // Exportar PDF
    doc.setFontSize(6);
    const privacyText =
      'La información proporcionada por el cliente será tratada de acuerdo con nuestra política de privacidad. ' +
      'Los datos se utilizarán exclusivamente para la emisión de esta factura y otros fines legales relacionados.';

    doc.text(privacyText, 10, afterTableY + 65, {
      maxWidth: 190,
      align: 'justify',
    });

    // Texto legal adicional
    doc.setFontSize(5);
    const legalText =
      'Esta factura electrónica se emite en cumplimiento de las disposiciones establecidas en el artículo 616-1 del Estatuto Tributario, ' +
      'los artículos 615 y 617 del mismo cuerpo normativo, y el artículo 1.6.1.4.2 del Decreto 1625 de 2016, que regula la expedición de ' +
      'facturas electrónicas y documentos equivalentes. Adicionalmente, se ajusta a lo estipulado en la Resolución 000165 de 2023, ' +
      'que desarrolla el sistema de facturación electrónica, adoptando la versión 1.9 del anexo técnico de la factura electrónica de ' +
      'venta, y a la Resolución 000189 de 2024, que modifica la Resolución 000165 de 2023, específicamente en los artículos 11 y 12, ' +
      'incorporando información adicional sobre la facturación de operaciones de compra y venta de divisas y cheques de viajero. ' +
      'Además, cumple con el parágrafo 6 del artículo 84 de la Resolución Externa 1 de 2018, modificada por la Resolución 07 de 2021, ' +
      'que establece los requisitos para las operaciones de cambio. También se ajusta a las disposiciones de la Ley 142 de 1994 y ' +
      'la Ley 2294 de 2023, en relación con los servicios públicos domiciliarios, y al Decreto 1697 de 2023 sobre los Gestores ' +
      'Comunitarios. Este documento respeta las normas vigentes para garantizar la legalidad y seguridad de la transacción.';

    doc.text(legalText, 10, afterTableY + 72, {
      maxWidth: 190,
      align: 'justify',
    });

    // Exportar PDF
    const pdfData = doc.output('arraybuffer');
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=factura_${invoiceNumber}.pdf`,
    );
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

  formatInvoiceNumber(number: number): string {
    return `FV-${number.toString().padStart(5, '0')}`;
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
