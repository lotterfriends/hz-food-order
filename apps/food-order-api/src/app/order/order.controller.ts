import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderGateway } from '../gateway/order-gateway';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderStatus } from './types/order-status';


@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderGateway: OrderGateway
  ) {}


  @Get()
  async getAll(
    @Query('skip') skip: number,
    @Query('status') status: string,
    @Query('product-categories') productCategories: string,
    @Query('table') table: string,
    @Query('code') code: string
  ) {
    const filter:{orderStatus?: OrderStatus[] | null, productCategories?: number[], table?: number, code?: string} = {};
    if (status || productCategories || table) {
      if (status) {
        filter.orderStatus = status.split(',') as OrderStatus[]
      }
      if (productCategories) {
        filter.productCategories = productCategories.split(',').map(e => parseInt(e, 10));
      }
      if (table) {
        filter.table = parseInt(table, 10);
      }
      if (code && code.length) {
        filter.code = code;
      }
    }
    return this.orderService.getAll(skip, filter);
  }

  @Post('change-status/:id')
  async changeStatus(@Param('id') id: number, @Body() body: {status: OrderStatus}) {
    if (!Object.values(OrderStatus).includes(body.status)) {
      throw new BadRequestException('invalid status');
    }
    const order = await this.orderService.updateOrderStatus(id, body.status);
    const respnseOrder: Order = {
      id: order.id,
      orderMessage: order.orderMessage,
      status: order.status,
      comment: order.comment,
      table: {
        id: order.table.id,
        name: order.table.name
      }
    } as Order;
    this.orderGateway.sendOrderUpdateToTable(respnseOrder, order.table);
    const adminOrder = await this.orderService.findOneWithId(order.id);
    this.orderGateway.sendOrderUpdateToUser(adminOrder);
    return respnseOrder;
  }
  
  @Post('message/:id')
  async sendOrderMessage(@Param('id') id: number, @Body() body: {message: string}) {
    if (body && body.message && body.message.trim().length) {
      const order = await this.orderService.updateOrderMessage(id, body.message);
      const respnseOrder: Order = {
        id: order.id,
        orderMessage: order.orderMessage,
        status: order.status,
        comment: order.comment,
        table: {
          id: order.table.id,
          name: order.table.name
        }
      } as Order;
      this.orderGateway.sendOrderUpdateToTable(respnseOrder, order.table);
      return respnseOrder;
    }
  }

  @Post('archive')
  async archive() {
    this.orderService.archiveAllActiveOrders();
  }
}
