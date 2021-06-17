import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { Table } from './table.entity';
import { TableService } from './table.service';
import { randomStringGenerator  } from '@nestjs/common/utils/random-string-generator.util';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty } from 'class-validator';
import { SettingsService } from '../settings/settings.service';

export class TableDto {
  @IsNotEmpty()
  name: string;

  key: string;
}

export interface TableWithSecret extends Table {
  secret?: string;
}

@Controller('tables')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly settingsService: SettingsService
  ) {}


  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTableDto: TableDto) {
    if (!createTableDto.name || !createTableDto.name.length) {
      throw new HttpException('name empty', HttpStatus.BAD_REQUEST);
    }
    createTableDto.key = randomStringGenerator();
    let table = await this.tableService.save(createTableDto);
    return this.tableService.addSecretToTable(table);
  }

  @Post(':id/rename')
  @UseGuards(JwtAuthGuard)
  async rename(@Param('id') id: number, @Body() body: { name: string}) {
    return this.tableService.renameTable(id, body.name);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: number, @Body() table: Table): Promise<Table> {
    return this.tableService.updateTable(id, table);
  }


  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll() {
    const tables = await this.tableService.getAll();
    return this.tableService.addSecretToTables(tables);
  }

  @Get(':secret')
  @UseGuards(JwtAuthGuard)
  async getTable(@Param('secret') secret: string) {
    return this.tableService.getTableForSecret(secret);
  }

  @Get('code/:code')
  async getTableForCode(@Param('code') code: string) {
    const isTableCodeEnabled = await this.settingsService.isTableCodeEnabled();
    if (!isTableCodeEnabled) {
      throw new BadRequestException('table code is disabled');
    }
    if (code.length < 6) {
      throw new BadRequestException('code to short');
    }
    return this.tableService.getTableForCode(code);
  }

}
