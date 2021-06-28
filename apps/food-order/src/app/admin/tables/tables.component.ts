import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { filter, first } from 'rxjs/operators';
import { PublicTableService } from '../../public-table.service';
import { Settings, SettingsService } from '../../settings.service';
import { AdminTablesService, Table } from '../services/admin-tables.service';

interface ViewTable extends Table {
  edit: boolean;
}

@Component({
  selector: 'hz-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {

  tables: ViewTable[] = [];
  editTables: ViewTable[] = [];
  tableName = '';
  settings: Settings;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  value = PublicTableService.URL_PREFIX;
  showMainContent = true;

  constructor(
    private adminTablesService: AdminTablesService,
    private  settingsService: SettingsService,
    private router: Router,
  ) {
    router.events.subscribe((val) => {
      this.showMainContent = val instanceof NavigationEnd && this.isMainRoute();
  });
  }

  isMainRoute(): boolean {
    return this.router.url === '/admin/tables';
  }

  getTables(): void {
    this.adminTablesService.getTables().pipe(first()).subscribe(result => {
      this.tables = result.map((e) => {
        return  {
          edit: false,
          ...e
        };
      });
      sessionStorage.setItem('tables', JSON.stringify(result));
      this.tableName = `Tisch ${this.tables.length + 1}`;
    });
  }

  addTable(): void {
    this.adminTablesService.createTable(this.tableName).pipe(first()).subscribe((table: Table) => {
      this.tables.push({edit: false, ...table});
      this.tableName = `Tisch ${this.tables.length + 1}`;
    });
  }

  startEdit(item: ViewTable): void {
    this.editTables.push({ ...item});
    item.edit = true;
  }

  saveEdit(table: ViewTable): void {
    this.adminTablesService.updateTable(table.id, {name: table.name, code: table.code} as Table).pipe(first()).subscribe(result => {
      const tableIndex = this.tables.findIndex(e => e.id === result.id);
      this.tables[tableIndex] = { edit: false, ...result};
    });
  }

  cancelEdit(item: ViewTable): void {
    const editTableIndex = this.editTables.findIndex(e => e.id === item.id);
    if (editTableIndex > -1) {
      const itemIndex = this.tables.findIndex(e => e.id === this.editTables[editTableIndex].id);
      this.tables[itemIndex] = this.editTables[editTableIndex];
      this.editTables.splice(editTableIndex, 1);
    }
  }

  openPrintDocument(table: ViewTable): void {
    this.router.navigateByUrl(`/admin/tables/print?tableId=${table.id}`);
  }

  ngOnInit(): void {
    this.settingsService.getSettings().pipe(filter(e => e !== null), first()).subscribe(settings => {
      this.settings = settings;
    });
    this.getTables();
  }

}
