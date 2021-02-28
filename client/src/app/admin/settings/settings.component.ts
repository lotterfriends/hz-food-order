import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'src/app/confirm-dialog/confirm-dialog.component';
import { AdminOrderService } from '../services/admin-order.service';
import { AdminSettingsService, Settings } from '../services/admin-settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  serverSecret = '';
  secret = '';

  constructor(
    private adminOrderService: AdminOrderService,
    private adminSettingsService: AdminSettingsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.adminSettingsService.getSettings().pipe(first()).subscribe(settings => {
      this.secret = settings.secret;
      this.serverSecret = this.secret;
    });
  }

  updateSecret(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Achtung', 'Wenn sie den Schlüssel ändern, werden allen bisher erstellten QR-Codes ungültig.')
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        this.adminSettingsService.updateSecret(this.secret).pipe(first()).subscribe((settings: Settings) => {
          this.secret = settings.secret;
          this.serverSecret = this.secret;
        });
      }
    });
  }

  getNewSecret(): void {
    this.adminSettingsService.getNewSecret().pipe(first()).subscribe(newSecretObject => {
      this.secret = newSecretObject.secret;
    });
  }

  archive(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Achtung', 'Alle Bestellungen werden archiviert')
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        this.adminOrderService.archive().pipe(first()).subscribe(e => {
          // 
        });
      }
    });
  }

}
