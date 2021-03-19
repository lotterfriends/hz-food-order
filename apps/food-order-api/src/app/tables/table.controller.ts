import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Table } from './table.entity';
import { TableService } from './table.service';
import { randomStringGenerator  } from '@nestjs/common/utils/random-string-generator.util';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty } from 'class-validator';

export class TableDto {
  @IsNotEmpty()
  name: string;

  key: string;
}

export interface TableWithSecret extends Table {
  secret?: string;
}

@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TableController {
  constructor(
    private readonly tableService: TableService
  ) {}


  @Post()
  async create(@Body() createTableDto: TableDto) {
    if (!createTableDto.name || !createTableDto.name.length) {
      throw new HttpException('name empty', HttpStatus.BAD_REQUEST);
    }
    createTableDto.key = randomStringGenerator();
    let table = await this.tableService.save(createTableDto);
    return this.tableService.addSecretToTable(table);
  }

  @Post(':id/rename')
  async rename(@Param('id') id: number, @Body() body: { name: string}) {
    return this.tableService.renameTable(id, body.name);
  }

  @Get()
  async getAll() {
    const tables = await this.tableService.getAll();
    return this.tableService.addSecretToTables(tables);
  }

  @Get(':secret')
  async getTable(@Param('secret') secret: string) {
    return this.tableService.getTableForSecret(secret);
  }



}
