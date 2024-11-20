import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from 'src/audit/entities/audit.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Role } from 'src/shared/enums/roles.enum';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'John',
    description: "User's first name",
  })
  @Column()
  firstName: string;

  @ApiProperty({
    example: 'David',
    description: "User's middle name",
  })
  @Column({ nullable: true })
  middleName: string;

  @ApiProperty({
    example: 'Doe',
    description: "User's last name",
  })
  @Column()
  lastName: string;

  @ApiProperty({
    example: 'Doe',
    description: "User's second last name",
  })
  @Column({ nullable: true })
  secondLastName: string;

  @ApiProperty({
    example: 'uq0Jt@example.com',
    description: 'User email',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: '123456789',
    description: 'User phone number',
  })
  @Column()
  phoneNumber: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'User profile image',
  })
  @Column({ nullable: true })
  profileImage?: string;

  @ApiProperty({
    example: 'Password123@',
    description: 'User password',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: true,
    description: 'User account confirmation status',
  })
  @Column({ default: false })
  isConfirmed: boolean;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.users, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @OneToOne(() => Supermarket, (supermarket) => supermarket.owner)
  ownedSupermarket: Supermarket;

  @OneToMany(() => Sale, (sale) => sale.user)
  sales: Sale[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user, {
    cascade: true,
  })
  auditLogs: AuditLog[];

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'User creation date',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'User update date',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiProperty({
    example: 'cashier',
    description: 'User role',
    default: 'viewer',
  })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Viewer,
  })
  role: Role;

  getFullName?(): string {
    return `${this.firstName}${this.middleName ?? ''} ${this.lastName} ${this.secondLastName ?? ''}`.trim();
  }
}
