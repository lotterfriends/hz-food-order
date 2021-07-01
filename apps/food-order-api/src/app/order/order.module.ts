import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesModule } from '../tables/table.module';
import { ProductsModule } from '../products/products.module';
import { OrderItem } from './order-item.entity';
import { TableOrderController } from './table-order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AppService } from '../app.service';
import { AuthModule } from '../auth/auth.module';
import { GatewayModule } from '../gateway/gateways.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    TablesModule,
    ProductsModule,
    AuthModule,
    SettingsModule,
    GatewayModule
  ],
  controllers: [TableOrderController, OrderController],
  providers: [OrderService, AppService],
})
export class OrderModule {}
