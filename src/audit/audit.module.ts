import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}
