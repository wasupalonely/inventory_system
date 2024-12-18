// src/audit/audit.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('audits')
@ApiTags('Audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditService.getAuditLogs();
  }

  @Get('by-table')
  async getLogsByTable(@Query('table') table: string): Promise<AuditLog[]> {
    return this.auditService.getAuditLogsByTable(table);
  }

  @Get('/supermarket/:id')
  async getAuditsBySupermarketId(
    @Param('id') supermarketId: number,
  ): Promise<AuditLog[]> {
    return this.auditService.getAuditsBySupermarketId(supermarketId);
  }
}
