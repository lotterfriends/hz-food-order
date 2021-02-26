import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesModule } from 'src/tables/table.module';
import { ProductsModule } from '../products/products.module';
import { OrderItem } from './order-item.entity';
import { TableOrderController } from './table-order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderGateway } from 'src/order/order-gateway';
import { AppService } from 'src/app.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    TablesModule,
    ProductsModule,
    AuthModule
  ],
  controllers: [TableOrderController, OrderController],
  providers: [OrderService, OrderGateway, AppService],
})
export class OrderModule {}
