// src/sales/sale.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { User } from 'src/user/entities/user.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sales)
  user: User;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.sales, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, { cascade: true })
  saleItems: SaleItem[];

  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
