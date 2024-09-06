import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Supermarket } from './supermarket.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  number: number;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @OneToOne(() => Supermarket, (supermarket) => supermarket.address)
  supermarket: Supermarket;
}
