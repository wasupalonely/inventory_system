import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supermarket)
  @JoinColumn({ name: 'supermarket_id' })
  supermarket: Supermarket;

  @Column('double')
  fresh: number;

  @Column('double')
  halfFresh: number;

  @Column('double')
  soiled: number;

  @Column('timestamp')
  fecha: Date;
}
