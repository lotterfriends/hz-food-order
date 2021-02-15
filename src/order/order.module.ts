import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesModule } from 'src/tables/table.module';
import { MealModule } from '../meal/meal.module';
import { OrderItem } from './order-item.entity';
import { TableOrderController } from './table-order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderGateway } from 'src/order-gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    TablesModule,
    MealModule
  ],
  controllers: [TableOrderController, OrderController],
  providers: [OrderService, OrderGateway],
})
export class OrderModule {}
