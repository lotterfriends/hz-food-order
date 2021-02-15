import { BadRequestException, Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderGateway } from 'src/order-gateway';
import { TableService } from 'src/tables/table.service';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderDto } from './types/oder-dto';
import { OrderStatus } from './types/order-status';


@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
    private readonly orderGateway: OrderGateway
  ) {}


  @Get()
  async getAll() {
    return this.orderService.getAll();
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
    this.orderGateway.sendOrderUpdateToTable(respnseOrder);
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
      this.orderGateway.sendOrderUpdateToTable(respnseOrder);
      return respnseOrder;
    }
  }
}
