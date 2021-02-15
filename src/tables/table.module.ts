import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from 'src/settings/settings.module';
import { TableController } from './table.controller';
import { Table } from './table.entity';
import { TableService } from './table.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table]),
    SettingsModule
  ],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService]
})
export class TablesModule {}
