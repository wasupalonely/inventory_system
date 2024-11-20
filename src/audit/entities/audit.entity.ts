import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  supermarket_id: number;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.auditLogs, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supermarket_id' })
  supermarket: Supermarket;

  @Column({ nullable: true })
  record_id: number;

  @Column({ nullable: true })
  ip_address: string;

  @Column()
  table_name: string;

  @Column()
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  old_data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  new_data: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
