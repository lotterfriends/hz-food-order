import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { OrderGateway } from '../gateway/order-gateway';
import { ProductsService } from '../products/products.service';
import { TableService } from '../tables/table.service';
import { OrderService } from './order.service';
import { OrderDto } from './types/oder-dto';


@Controller('table-orders')
export class TableOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
    private readonly productService: ProductsService,
    private readonly orderGateway: OrderGateway
  ) {}


  @Post()
  async create(@Body() createOrderDto: OrderDto, @Headers('X-secret') secretHeader) {
    const table = await this.tableService.getTableForSecret(secretHeader);
    if (!table) {
      throw new UnauthorizedException();
    }
    if (table) {
      const order = await this.orderService.saveOrderForTable(table, createOrderDto);
      this.orderGateway.sendOrderUpdateToUser(order);
      return order;
    }
  }

  @Get()
  async getAll(@Headers('X-secret') secretHeader) {
    const table = await this.tableService.getTableForSecret(secretHeader);
    if (!table) {
      throw new UnauthorizedException();
    }
    return this.orderService.getAllForTable(table);
  }

  @Get('products')
  async getAllProducts(@Headers('X-secret') secretHeader) {
    const table = await this.tableService.getTableForSecret(secretHeader);
    if (!table) {
      throw new UnauthorizedException();
    }
    return this.productService.getAllEnabled();
  }

  @Get(':secret')
  async getTable(@Param('secret') secret: string) {
    return this.tableService.getTableForSecret(secret);
  }
}
