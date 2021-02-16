import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import { MealService } from 'src/meal/meal.service';
import { Table } from 'src/tables/table.entity';
import { Not, Repository} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { OrderDto } from './types/oder-dto';
import { OrderStatus } from './types/order-status';
@Injectable()
export class OrderService {

  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly mealService: MealService,
    private readonly appService: AppService
  ) {}

  async saveOrderForTable(table: Table, createOrderDto: OrderDto): Promise<Order> {
    const order = new Order();
    order.comment = createOrderDto.comment;
    order.status = OrderStatus.InPreparation;
    order.table = table;
    order.items = [];
    order.code = `${this.appService.randomString(3, true, true)}-${this.appService.randomString(3, true, true)}`.toUpperCase();
    for(const mealItem of createOrderDto.items) {
      const orderItem = new OrderItem();
      const currentMeal = await this.mealService.findOneWithId(mealItem.id);
      await this.mealService.decreaseStock(currentMeal.id, mealItem.count);
      orderItem.meal = currentMeal;
      orderItem.count = mealItem.count;
      order.items.push(orderItem);
    }
    return this.orderRepository.save(order);
  }

  getAllForTable(table: Table) {
    return this.orderRepository.find({
      select: ['id', 'status', 'orderMessage', 'comment', 'code'],
      relations: ['table', 'items', 'items.meal'],
      order: {
        created: 'ASC'
      },
      where: {
        table: table,
        status: Not(OrderStatus.Archived)
      }
    });
  }

  getAll() {
    return this.orderRepository.find({
      relations: ['table', 'items', 'items.meal'],
      where: {
        status: Not(OrderStatus.Archived)
      },
      order: {
        created: 'ASC'
      }
    });
  }

  async archiveAllActiveOrders() {
    return this.orderRepository.createQueryBuilder()
      .update()
      .set({ status: OrderStatus.Archived})
      .where(`status != :achivedStatus`, { achivedStatus: OrderStatus.Archived})
      .execute();
  }

  findOneWithId(id: number) {
    return this.orderRepository.findOne(id);
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne(orderId, {
      relations: ['table']
    });
    order.status = status;
    return this.orderRepository.save(order);
  }

  async updateOrderMessage(orderId: number, message: string) {
    const order = await this.orderRepository.findOne(orderId, {
      relations: ['table']
    });
    order.orderMessage = message;
    return this.orderRepository.save(order);
  }

}
