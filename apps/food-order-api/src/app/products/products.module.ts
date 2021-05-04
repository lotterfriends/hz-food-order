import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayModule } from '../gateway/gateways.module';
import { SettingsModule } from '../settings/settings.module';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategory } from './products-category.entity';
import { ProductsController } from './products.controller';
import { Product } from './products.entity';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory]),
    SettingsModule,
    GatewayModule
  ],
  controllers: [
    ProductsController,
    ProductCategoriesController
  ],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
