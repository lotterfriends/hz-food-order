import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from '../app.service';
import { ProductsService } from '../products/products.service';
import { Table } from '../tables/table.entity';
import { Not, Repository} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { OrderDto } from './types/oder-dto';
import { OrderStatus } from './types/order-status';
import { SettingsService } from '../settings/settings.service';
@Injectable()
export class OrderService {

  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly appService: AppService,
    private readonly settingsService: SettingsService
  ) {}

  async saveOrderForTable(table: Table, createOrderDto: OrderDto): Promise<Order> {
    const order = new Order();
    order.comment = createOrderDto.comment;
    order.status = OrderStatus.InPreparation;
    order.table = table;
    order.items = [];
    order.code = `${this.appService.randomString(3, true, true)}-${this.appService.randomString(3, true, true)}`.toUpperCase();
    for(const item of createOrderDto.items) {
      const orderItem = new OrderItem();
      const currentItem = await this.productsService.findOneWithId(item.id);
      await this.productsService.decreaseStock(currentItem.id, item.count);
      orderItem.product = currentItem;
      orderItem.count = item.count;
      order.items.push(orderItem);
    }
    return this.orderRepository.save(order);
  }

  getAllForTable(table: Table) {
    return this.orderRepository.find({
      select: ['id', 'status', 'orderMessage', 'comment', 'code'],
      relations: ['table', 'items', 'items.product'],
      order: {
        created: 'ASC'
      },
      where: {
        table: table,
        status: Not(OrderStatus.Archived)
      }
    });
  }

  async getAll(skip: number, filter?: {orderStatus?: OrderStatus[], productCategories?: number[], table?: number}) {
    const settings = await this.settingsService.getSettings();
    const query = this.orderRepository.createQueryBuilder('o')
      .innerJoinAndSelect('o.table', 't')
      .innerJoinAndSelect('o.items', 'i')
      .innerJoinAndSelect('i.product', 'p')
      .innerJoinAndSelect('p.category', 'c')

    query.where('archived is null')
    query.andWhere('o.status in (:orderStatus)', {orderStatus: filter.orderStatus})
    if (filter.table) {
      query.andWhere('t.id = :table', {table: filter.table})
    }
    if (settings.seperateOrderPerProductCategory) {
      query.andWhere('c.id in (:productCategories)', {productCategories: filter.productCategories})
    }
    query.orderBy('o.created', 'ASC')

    query.skip(skip || 0)
      .take(10);

    return query.getManyAndCount();

    // return this.orderRepository.find({
    //   relations: ['table', 'items', 'items.product'],
    //   where: {
    //     status: Not(OrderStatus.Archived),
    //   },
    //   order: {
    //     created: 'ASC'
    //   }
    // });
  }

  async archiveAllActiveOrders() {
    const archived = new Date();
    return this.orderRepository.createQueryBuilder()
      .update()
      .set({ archived: archived})
      .where(`archived is null`)
      .execute();
  }

  findOneWithId(id: number) {
    return this.orderRepository.findOne(id, {
      relations: ['table', 'items', 'items.product']
    });
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
