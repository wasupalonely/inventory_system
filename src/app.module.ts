import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
// import { PredictionsModule } from './predictions/predictions.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { SupermarketModule } from './supermarket/supermarket.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 300,
    //     limit: 1,
    //   },
    // ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        entities: ['dist/**/entities/*.entity{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    SupermarketModule,
    UserModule,
    AuthModule,
    // PredictionsModule,
    ProductsModule,
    CategoriesModule,
    SalesModule,
    MailModule,
    InventoryModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
