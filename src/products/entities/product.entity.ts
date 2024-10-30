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
    example: 'Lettuce',
    description: 'THe name of the product',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Roman lettuce',
    description: 'Product description',
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    example: 1500,
    description: 'The price of the product',
  })
  @Column()
  price: number;

  @ManyToOne(() => Category, (category) => category.products)
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
    description: 'Product creation date',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Product update date',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
