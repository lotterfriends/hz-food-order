import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesModule } from '../tables/table.module';
import { ProductsModule } from '../products/products.module';
import { OrderGateway } from './order-gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TablesModule,
    AuthModule
  ],
  controllers: [],
  providers: [OrderGateway],
  exports: [OrderGateway]
})
export class GatewayModule {}
