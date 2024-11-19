import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async getAuditLogs(): Promise<AuditLog[]> {
    return await this.auditRepo.find({
      order: { timestamp: 'DESC' },
    });
  }

  async getAuditLogsByTable(tableName: string): Promise<AuditLog[]> {
    return await this.auditRepo.find({
      where: { table_name: tableName },
      order: { timestamp: 'DESC' },
    });
  }

  async getAuditsBySupermarketId(supermarketId: number): Promise<AuditLog[]> {
    return await this.auditRepo.find({
      where: { supermarket_id: supermarketId },
      order: { timestamp: 'DESC' },
      relations: ['supermarket', 'user'],
    });
  }
}
