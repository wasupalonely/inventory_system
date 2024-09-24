import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';

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
  @Column()
  description: string;

  @ApiProperty({
    example: 1500,
    description: 'The price of the product',
  })
  @Column()
  price: number;

  @ApiProperty({
    example: 4,
    description: 'The quantity of the product',
  })
  @Column({ default: 0 })
  quantity: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.products)
  supermarket: Supermarket;

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
