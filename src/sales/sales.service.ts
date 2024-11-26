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
    orientation: 'portrait', // Cambiado a horizontal
    unit: 'mm',
    format: 'a4', // Formato tamaño A4
  });
  
  // Función para formatear el monto como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Número de factura aleatorio
  const randomInvoiceNumber = Math.floor(Math.random() * 1000000);
  
  // Encabezado
  doc.setFont('Courier', 'bold');
  doc.setFontSize(10);
  doc.text('Factura Electrónica de Venta', 105, 15, { align: 'center' });
  doc.text(`No. ${randomInvoiceNumber}`, 105, 20, { align: 'center' });
  
 // Obtener datos de la empresa
const companyName = this.supermarketService.getSupermarket.name; // Nombre de la empresa
const companyNIT = 'nit quemado'; // NIT de la empresa
const companyAddress = 'mercado quemada'; // Dirección de la empresa
const CUFE = '1234567890ABCDEF1234567890ABCDEF';  // CUFE estático
const razonSocial = 'razon social quemada';

// Mostrar los datos de la empresa en el PDF
doc.text(companyName, 10, 30); // Nombre de la empresa
doc.text(`Razón Social: ${razonSocial}`, 10, 35); // Razón social (puedes personalizar si es diferente al nombre)
doc.text(`NIT: ${companyNIT}`, 10, 40); // NIT de la empresa
doc.text(`Dirección: ${companyAddress}`, 10, 45); // Dirección de la empresa

// Mostrar el CUFE
doc.text(`CUFE: ${CUFE}`, 105, 25, { align: 'center' }); // CUFE estático
// ... en el encabezado, después del número de factura
doc.text(`CUFE: ${CUFE}`, 105, 25, { align: 'center' });  // Nueva línea para el CUFE
  
  // Detalles generales de la factura
  const detailsStartY = 55;
  doc.setFont('Courier', 'normal');
  doc.text(`Fecha y Hora: ${moment().format('DD MMM [del] YYYY HH:mm')}`, 10, detailsStartY);
  doc.text('Forma de Pago: Contado', 10, detailsStartY + 5); // Forma de pago (quemado)
  doc.text('Medio de Pago: Efectivo', 10, detailsStartY + 10); // Medio de pago (quemado)
  doc.text('Vendedor: quemado', 10, detailsStartY + 15); // Vendedor (fijo por ahora)
  doc.text('Cliente: CONSUMIDOR FINAL', 10, detailsStartY + 20); // Cliente (quemado)
  doc.text('Documento: 222222222222', 10, detailsStartY + 25); // Documento (quemado)
  doc.text('Teléfono: 6063301300', 10, detailsStartY + 30); // Teléfono (quemado)
  
  // Línea separadora
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(10, detailsStartY + 35, 200, detailsStartY + 35);
  
  // Tabla dinámica de productos
const tableColumns = [
  { header: 'Producto', dataKey: 'product' },
  { header: 'Descripción', dataKey: 'description' },
  { header: 'Precio x Unidad', dataKey: 'pricePerUnit' },
  { header: 'Cantidad', dataKey: 'quantity' },
  { header: 'Subtotal', dataKey: 'subtotal' },
];

const tableRows = sale.saleItems.map((item) => ({
  product: item.product.name,
  description: item.product.description || 'N/A',
  pricePerUnit: formatCurrency(item.product.price),
  quantity: item.quantity,
  subtotal: formatCurrency(item.product.price * item.quantity),
}));

(doc as any).autoTable({
  startY: 90,
  columns: tableColumns,
  body: tableRows,
  theme: 'plain',
  styles: { font: 'Courier', fontSize: 10, cellPadding: 2 },
  headStyles: { fontStyle: 'bold' },
  columnStyles: {
    product: { cellWidth: 40 },
    description: { cellWidth: 60 },
    pricePerUnit: { cellWidth: 30 },
    quantity: { cellWidth: 20 },
    subtotal: { cellWidth: 40 },
  },
});
  
  // Línea separadora después de la tabla
  const afterTableY = (doc as any).lastAutoTable.finalY;
  doc.line(10, afterTableY + 5, 200, afterTableY + 5);
  doc.setFontSize(10);
// Totales
const subtotal = sale.totalPrice; // Total de la venta
const iva = 0; // IVA (estático)
const total = subtotal + iva; // Total (igual al subtotal en este caso)

// Mostrar los totales en el PDF
doc.text(`                                                                Subtotal: ${formatCurrency(subtotal)}`, 10, afterTableY + 10); // Subtotal
doc.text(`                                                                     IVA: ${formatCurrency(iva)}`, 10, afterTableY + 15); // IVA (quemado)
doc.text(`                                                                   Total: ${formatCurrency(total)}`, 10, afterTableY + 20); // Total

  
  // Línea separadora antes de la información adicional
  doc.line(10, afterTableY + 25, 200, afterTableY + 25);
  
  // Información adicional
  doc.text('PORTAL WEB PARA FACTURA ELECTRÓNICA EN', 110, afterTableY + 35, { align: 'center' });
  doc.text('https://inventory-frontend-tau-ecru.vercel.app/', 110, afterTableY + 40, { align: 'center' });
  doc.text('GRACIAS POR SU COMPRA', 110, afterTableY + 50, { align: 'center' });
  doc.text('NO SE ACEPTAN DEVOLUCIONES', 110, afterTableY + 55, { align: 'center' });
  
  // Línea separadora antes de la política de privacidad
  doc.line(10, afterTableY + 60, 200, afterTableY + 60);
  
  // Política de privacidad
  doc.setFontSize(8);
  const privacyText =
    'La información proporcionada por el cliente será tratada de acuerdo con nuestra política de privacidad. ' +
    'Los datos se utilizarán exclusivamente para la emisión de esta factura y otros fines legales relacionados.';
  
  doc.text(privacyText, 10, afterTableY + 70, { maxWidth: 190, align: 'justify' });
  
  // Texto legal adicional
  doc.setFontSize(6);
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
  
  doc.text(legalText, 10, afterTableY + 90, { maxWidth: 190, align: 'justify' });
  
  // Exportar PDF
  const pdfData = doc.output('arraybuffer');
  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', `attachment; filename=factura_${randomInvoiceNumber}.pdf`);
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
