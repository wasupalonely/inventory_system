import { ApiProperty } from '@nestjs/swagger';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {
  @ApiProperty({
    example: 1,
    description: 'Notification ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.notifications, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @Column()
  title: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
