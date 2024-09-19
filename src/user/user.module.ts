import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SupermarketModule } from 'src/supermarket/supermarket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => SupermarketModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
