// src/sales/sales.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';

interface ProductQuantity {
  productId: number;
  quantity: number;
}

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
  ) {}

  async createSale(
    userId: number,
    supermarketId: number,
    productQuantities: ProductQuantity[],
    totalPrice: number,
  ) {
    const sale = new Sale();
    sale.user = { id: userId } as any; // Relación con el usuario
    sale.supermarket = { id: supermarketId } as Supermarket;
    sale.totalPrice = totalPrice;

    const saleItems: SaleItem[] = [];

    for (const { productId, quantity } of productQuantities) {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new Error(`Producto con ID ${productId} no encontrado`);
      }

      const inventory = await this.inventoryRepository.findOne({
        where: { product: product, supermarket: { id: supermarketId } },
      });
      if (!inventory || inventory.stock < quantity) {
        throw new Error(`Stock insuficiente para el producto ${product.name}`);
      }

      inventory.stock -= quantity;
      await this.inventoryRepository.save(inventory);

      const saleItem = new SaleItem();
      saleItem.product = product;
      saleItem.quantity = quantity;
      saleItems.push(saleItem);
    }

    sale.saleItems = saleItems;
    await this.saleRepository.save(sale);
    return sale;
  }
}
