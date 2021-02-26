import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { first } from 'rxjs/operators';
import { AdminTablesService, Table } from '../services/admin-tables.service';

interface ViewTable extends Table {
  edit: boolean;
}

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {
  
  tables: ViewTable[] = [];
  editTables: ViewTable[] = [];
  tableName: string = '';
  tableCode: string = '';

  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  value = `${location.origin}/order/` ;


  constructor(
    private adminTablesService: AdminTablesService,
    private router: Router,
  ) { }

  getTables() {
    this.adminTablesService.getTables().pipe(first()).subscribe(result => {
      this.tables = result.map((e) => {
        return  {
          edit: false,
          ...e
        }
      });
    });
  }

  addTable() {
    this.adminTablesService.createTable(this.tableName).pipe(first()).subscribe((table: Table) => {
      this.tableName = '';
      this.tables.push({edit: false, ...table});
    })
  }

  startEdit(item: ViewTable) {
    this.editTables.push({ ...item});
    item.edit = true;
  }
  
  saveEdit(table: ViewTable) {
    this.adminTablesService.renameTable(table.id, table.name).pipe(first()).subscribe(result => {
      const tableIndex = this.tables.findIndex(e => e.id === result.id);
      this.tables[tableIndex] = { edit: false, ...result};
    })
  }

  cancelEdit(item: ViewTable) {
    const editTableIndex = this.editTables.findIndex(e => e.id === item.id);
    if (editTableIndex > -1) {
      const itemIndex = this.tables.findIndex(e => e.id === this.editTables[editTableIndex].id);
      this.tables[itemIndex] = this.editTables[editTableIndex];
      this.editTables.splice(editTableIndex, 1);
    }
  }

  openPrintDocument(table: ViewTable) {
    const url = this.value + table.secret;
    console.log(table);
    this.router.navigateByUrl('/print-table', { 
      state: { 
        url,
        name: table.name
      }
    });
  }

  ngOnInit(): void {
    this.getTables();
  }



}
