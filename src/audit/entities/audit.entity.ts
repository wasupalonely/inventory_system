// src/audit/audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

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
