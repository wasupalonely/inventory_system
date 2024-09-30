import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Sale } from 'src/sales/entities/sale.entity';

@Entity({ name: 'supermarket' })
export class Supermarket {
  @ApiProperty({
    example: 1,
    description: 'Supermarket ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Supermarket 123',
    description: 'Supermarket name',
  })
  @Column()
  name: string;

  @OneToOne(() => Address, (address) => address.supermarket)
  @JoinColumn()
  address: Address;

  @OneToOne(() => User, (user) => user.ownedSupermarket)
  @JoinColumn()
  owner: User;

  @OneToMany(() => Category, (category) => category.supermarket)
  categories: Category[];

  @OneToMany(() => User, (user) => user.supermarket)
  users: User[];

  @OneToMany(() => Product, (product) => product.supermarket)
  products: Product[];

  @OneToMany(() => Inventory, (inventory) => inventory.supermarket)
  inventory: Inventory[];

  @OneToMany(() => Sale, (sale) => sale.supermarket)
  sales: Sale[];

  @Column({ default: false })
  cronjobEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Supermarket creation date',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Supermarket update date',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
