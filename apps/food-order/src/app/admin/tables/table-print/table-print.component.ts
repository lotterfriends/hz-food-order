import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { filter, first } from 'rxjs/operators';
import { PublicTableService } from '../../../public-table.service';
import { Settings, SettingsService } from '../../../settings.service';
import { Table } from '../../services/admin-tables.service';

interface ViewTable extends Table {
  edit: boolean;
}

@UntilDestroy()
@Component({
  selector: 'hz-table-print',
  templateUrl: './table-print.component.html',
  styleUrls: ['./table-print.component.scss']
})
export class TablePrintComponent implements OnInit {
  tables: ViewTable[] = [];
  settings: Settings;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  value = PublicTableService.URL_PREFIX;
  tableId: number | null = null;
  public origin = location.host;

  constructor(
    private  settingsService: SettingsService,
    private route: ActivatedRoute
  ) {

    this.route.queryParams.subscribe(params => {
      if (params && params.tableId) {
        this.tableId = parseInt(params.tableId, 10);
      }
      this.getTables();
    });
  }

  getTables(): void {

    const tables = sessionStorage.getItem('tables') ? JSON.parse(sessionStorage.getItem('tables')) : [];

    if (this.tableId) {
      this.tables = tables.filter(e => e.id === this.tableId);
    } else {
      this.tables = tables;
    }

    setTimeout(() => {
      window.print();
    }, 2000);
  }

  ngOnInit(): void {
    this.settingsService.getSettings().pipe(filter(e => e !== null), first()).subscribe(settings => {
      this.settings = settings;
    });
  }


}
