import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { Settings, SettingsService } from '../settings.service';
import { EnterCodeDialogComponent } from './enter-code-dialog.component';
import { ScanCodeDialogComponent } from './scan-code-dialog.component';

@Component({
  selector: 'hz-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss']
})
export class EmptyComponent {

  settings: Settings;

  constructor(
    private dialog: MatDialog,
    private readonly settingsService: SettingsService
  ) {
    this.settingsService.getSettings().pipe(first()).subscribe(settings => {
      this.settings = settings;
    })
  }

  openCodeDialog(): void {
    this.dialog.open(EnterCodeDialogComponent, {
      maxWidth: '400px',
      data: {}
    });
  }
 
  openScanDialog(): void {
    const dialogRef = this.dialog.open(ScanCodeDialogComponent, {
      maxWidth: '400px',
      data: {}
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult && dialogResult.trim().length) {
        
      }
    });
  }

}
