import { Component, OnInit } from '@angular/core';
import { AdminService, Settings, Table } from '../admin.service';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { environment } from "../../../environments/environment";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'src/app/confirm-dialog/confirm-dialog.component';
import * as e from 'express';

interface ViewTable extends Table {
  edit: boolean;
}

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {
  
  serverSecret: string = '';
  secret: string = '';
  tables: ViewTable[] = [];
  editTables: ViewTable[] = [];
  tableName: string = '';
  tableCode: string = '';

  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  value = `${location.origin}/order/` ;


  constructor(
    private adminService: AdminService,
    private dialog: MatDialog
  ) { }

  updateSecret() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: new ConfirmDialogModel('Achtung', 'Wenn sie den Schlüssel ändern, werden allen bisher erstellten QR-Codes ungültig.')
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.adminService.updateSecret(this.secret).subscribe((settings: Settings) => {
          this.secret = settings.secret;
          this.serverSecret = this.secret;
          this.getTables();
        });
      }
    });

  }

  getTables() {
    this.adminService.getTables().subscribe(result => {
      this.tables = result.map((e) => {
        return  {
          edit: false,
          ...e
        }
      });
    });
  }

  getNewSecret() {
    this.adminService.getNewSecret().subscribe(newSecretObject => {
      this.secret = newSecretObject.secret;
    })
  }

  addTable() {
    this.adminService.createTable(this.tableName).subscribe((table: Table) => {
      this.tableName = '';
      this.tables.push({edit: false, ...table});
    })
  }

  startEdit(meal: ViewTable) {
    this.editTables.push({ ...meal});
    meal.edit = true;
  }
  
  saveEdit(table: ViewTable) {
    this.adminService.renameTable(table.id, table.name).subscribe(result => {
      const tableIndex = this.tables.findIndex(e => e.id === result.id);
      this.tables[tableIndex] = { edit: false, ...result};
    })
  }

  cancelEdit(meal: ViewTable) {
    const editTableIndex = this.editTables.findIndex(e => e.id === meal.id);
    if (editTableIndex > -1) {
      const mealIndex = this.tables.findIndex(e => e.id === this.editTables[editTableIndex].id);
      this.tables[mealIndex] = this.editTables[editTableIndex];
      this.editTables.splice(editTableIndex, 1);
    }
  }

  ngOnInit(): void {
    this.getTables();

    this.adminService.getSettings().subscribe(settings => {
      this.secret = settings.secret;
      this.serverSecret = this.secret;
    });
  }



}
