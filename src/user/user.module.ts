import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SupermarketModule } from 'src/supermarket/supermarket.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => SupermarketModule),
    UploadModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
