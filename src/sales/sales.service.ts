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
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { SupermarketService } from 'src/supermarket/supermarket.service';

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
  
    const doc = new PDFDocument({ margin: 50 });
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=factura_${saleId}.pdf`,
    );
  
    doc.pipe(response);
  
    // Título de la factura (encabezado)
    doc.fontSize(20).font('Courier-Bold').text(`Factura de Venta #${saleId}`, { align: 'center' });
    doc.moveDown(1);
  
    // Detalles de la tienda y cliente
    doc.fontSize(12).font('Courier-Bold').text(`Supermercado:`, { align: 'left' });
    doc.fontSize(14).font('Courier').text(sale.supermarket.name, { align: 'left' });
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Courier-Bold').text(`Fecha:`, { align: 'left' });
    doc.fontSize(14).font('Courier').text(sale.date.toLocaleString(), { align: 'left' });
    doc.moveDown(0.5);
  
    doc.fontSize(12).font('Courier-Bold').text(`Vendedor:`, { align: 'left' });
    doc.fontSize(14).font('Courier').text(sale.user.getFullName(), { align: 'left' });
    doc.moveDown(0.5);
  
    doc.fontSize(12).font('Courier-Bold').text(`Total:`, { align: 'left' });
    doc.fontSize(14).font('Courier').text(`$${sale.totalPrice.toFixed(2)}`, { align: 'left' });
  
    // Línea de separación
    doc.moveDown(1);
    doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
  
    // Tabla de detalles de los productos
    doc.fontSize(16).font('Courier-Bold').text('Detalles de la Venta', { align: 'left' });
    doc.moveDown(0.5);
  
    // Encabezados de la tabla
    doc.fontSize(12).font('Courier-Bold').text(
      `#   Producto             Cantidad   Precio Unitario     Subtotal`, 
      { width: 500, align: 'left' }
    );
    doc.moveDown(0.5);
  
    // Líneas de los productos
    let yPos = doc.y;
    sale.saleItems.forEach((item, index) => {
      doc.fontSize(12).font('Courier').text(
        `${index + 1}   ${item.product.name}           ${item.quantity}         $${item.product.price.toFixed(2)}         $${(item.product.price * item.quantity).toFixed(2)}`,
        { width: 500, align: 'left' }
      );
      yPos = doc.y;
    });
  
    // Línea de separación final
    doc.moveDown(1);
    doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  
    // Firma o notas adicionales (si es necesario)
    doc.moveDown(1);
    doc.fontSize(12).font('Courier').text('Gracias por su compra. Si tiene alguna consulta, no dude en contactarnos.', { align: 'center' });
  
    // Finalizar el documento
    doc.end();
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
}
