import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsService } from '../settings/settings.service';
import { Repository } from 'typeorm';
import { TableDto, TableWithSecret } from './table.controller';
import { Table } from './table.entity';
import { createHash } from 'crypto';

@Injectable()
export class TableService {

  constructor(
    @InjectRepository(Table) private tableRepository: Repository<Table>,
    private readonly settingsService: SettingsService
  ) {}

  save(table: TableDto): Promise<Table> {
    return this.tableRepository.save(table);
  }

  getTable(id: number) {
    return this.tableRepository.findOne(id);
  }

  deleteTable(id: number) {
    return this.tableRepository.softDelete(id);
  }

  async renameTable(id: number, name: string) {
    const table = await this.tableRepository.findOne(id);
    table.name = name;
    this.tableRepository.update(table.id, {name});
    return table;
  }

  async updateTable(id: number, table: Table): Promise<Table> {
    await this.tableRepository.update(id, table);
    let changeTable = await this.tableRepository.findOne(id);
    return this.addSecretToTable(changeTable);
  }

  getAll() {
    return this.tableRepository.find();
  }

  async addSecretToTable(table: Table) {
    const serverSecret = process.env.SERVER_SECRET;
    const appSecret = await this.settingsService.getSecret();
    return {
      secret: createHash('sha256').update([table.key, appSecret, serverSecret].join('-')).digest('hex'),
      ...table
    };
  }

  async addSecretToTables(tables: Table[]) {
    const serverSecret = process.env.SERVER_SECRET;
    const appSecret = await this.settingsService.getSecret();
    const tablesWithSecret: TableWithSecret[] = tables.map((t: Table) => {
      return {
        secret: createHash('sha256').update([t.key, appSecret, serverSecret].join('-')).digest('hex'),
        key: '',
        ...t
      }
    })
    return tablesWithSecret;
  }

  async getTableForSecret(secret: string) {
    const serverSecret = process.env.SERVER_SECRET;
    const appSecret = await this.settingsService.getSecret();
    const tables = await this.getAll();
    let foundTable = null;
    for (const table of tables) {
      const hash = createHash('sha256').update([table.key, appSecret, serverSecret].join('-')).digest('hex');
      if (hash === secret) {
        foundTable = table;
      }
    }
    return foundTable;
  }

  async getTableForCode(code: string): Promise<{hash: string}> {
    const serverSecret = process.env.SERVER_SECRET;
    const appSecret = await this.settingsService.getSecret();
    const tables = await this.getAll();
    let foundHash = null;
    for (const table of tables) {
      const hash = createHash('sha256').update([table.key, appSecret, serverSecret].join('-')).digest('hex');
      if (hash.toUpperCase().endsWith(code.toUpperCase())) {
        foundHash = hash;
      }
    }
    if (foundHash) {
      return {hash: foundHash};
    }
    return foundHash;
  }

}
