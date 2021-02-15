import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { TableService } from 'src/tables/table.service';
import { OrderService } from './order.service';
import { OrderDto } from './types/oder-dto';


@Controller('table-orders')
export class TableOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly tableService: TableService
  ) {}


  @Post()
  async create(@Body() createOrderDto: OrderDto, @Headers('X-secret') secretHeader) {
    const table = await this.tableService.getTableForSecret(secretHeader);
    if (table) {
      return this.orderService.saveOrderForTable(table, createOrderDto);
    }
  }

  @Get()
  async getAll(@Headers('X-secret') secretHeader) {
    const table = await this.tableService.getTableForSecret(secretHeader);
    return this.orderService.getAllForTable(table);
  }
}
