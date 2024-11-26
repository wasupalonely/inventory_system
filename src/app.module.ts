import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { CloudinaryConfig } from './config/cloudinary.config';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { UserIdMiddleware } from './shared/middleware/user-id.middleware';
import { JwtService } from '@nestjs/jwt';
import { CamerasModule } from './cameras/cameras.module';
import { SeedService } from './seed/seed.service';
import { Category } from './categories/entities/category.entity';

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
    TypeOrmModule.forFeature([Category]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        entities: ['dist/**/entities/*.entity{.ts,.js}'],
        timezone: '-05:00',
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
    UploadModule,
    CloudinaryModule,
    NotificationsModule,
    AuditModule,
    CamerasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CloudinaryConfig,
    JwtService,
    SeedService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserIdMiddleware).forRoutes(
      // UserController,
      {
        path: 'users',
        method: RequestMethod.POST,
      },
      {
        path: 'users/:id',
        method: RequestMethod.PUT,
      },
      {
        path: 'users/supermarket/:id',
        method: RequestMethod.DELETE,
      },
      {
        path: 'inventory/add-stock',
        method: RequestMethod.POST,
      },
      {
        path: 'inventory/edit-stock/:productId/:supermarketId',
        method: RequestMethod.PUT,
      },
      {
        path: 'inventory/delete-inventory/:productId/:supermarketId',
        method: RequestMethod.DELETE,
      },
      {
        path: 'products',
        method: RequestMethod.POST,
      },
      {
        path: 'products/:id',
        method: RequestMethod.PUT,
      },
      {
        path: 'products/:id',
        method: RequestMethod.DELETE,
      },
    );
  }
}
