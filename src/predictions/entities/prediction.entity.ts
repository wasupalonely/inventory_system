import { Label } from 'src/shared/types/prediction';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.predictions, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @Column()
  result: Label;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'float' })
  fresh: number;

  @Column({ type: 'float' })
  halfFresh: number;

  @Column({ type: 'float' })
  spoiled: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
