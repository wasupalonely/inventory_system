// src/products/entities/product.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { SaleItem } from 'src/sales/entities/sale-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Ribeye Steak',
    description: 'The name of the meat product',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'A premium cut of ribeye steak.',
    description: 'Description of the meat product',
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'Image of the meat product',
  })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({
    example: 1500,
    description: 'Selling price of the meat product per pound (in COP)',
  })
  @Column()
  price: number;

  @ApiProperty({
    example: 37,
    description: 'Price of the meat product per pound (in COP)',
  })
  @Column({ nullable: true })
  pricePerPound: number;

  @ApiProperty({
    example: 1000,
    description: 'Weight of the meat product in pounds',
  })
  @Column({ nullable: true })
  weight: number;

  @ApiProperty({
    example: 1000,
    description:
      'Cost of the meat product per pound from the supplier (in COP)',
  })
  @Column()
  unitCost: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.products, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventory: Inventory[];

  @OneToMany(() => SaleItem, (saleItem) => saleItem.product)
  saleItems: SaleItem[];

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Creation date of the meat product entry',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Last update date of the meat product entry',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
