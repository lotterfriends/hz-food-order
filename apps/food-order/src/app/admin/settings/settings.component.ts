import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'libs/ui/src/lib/confirm-dialog/confirm-dialog.component';
import { first } from 'rxjs/operators';
import { SettingsService } from '../../settings.service';
import { AdminOrderService } from '../services/admin-order.service';
import { AdminSettingsService, Settings } from '../services/admin-settings.service';

@Component({
  selector: 'hz-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  serverSecret = '';
  secret = '';
  logo: File = null;
  logoPreview: string = '';
  logoUploadStarted = false;
  logoUploadProgress = 0;
  logoUploadError = false;
  seperateOrderPerProductCategory = false;
  disableProductOnOutOfStock = false;
  orderCode = false;
  pickupOrder = false;
  whileStocksLast = false;
  orderSound = false;
  settingsLogo = '';

  constructor(
    private adminOrderService: AdminOrderService,
    private adminSettingsService: AdminSettingsService,
    public settingsService: SettingsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.adminSettingsService.getSettings().pipe(first()).subscribe(settings => {
      this.secret = settings.secret;
      this.serverSecret = this.secret;
      this.seperateOrderPerProductCategory = settings.seperateOrderPerProductCategory;
      this.disableProductOnOutOfStock = settings.disableProductOnOutOfStock;
      this.orderCode = settings.orderCode;
      this.pickupOrder = settings.pickupOrder;
      this.whileStocksLast = settings.whileStocksLast;
      this.orderSound = settings.orderSound;
      this.settingsLogo = settings.logo;
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

  saveSettings(): void {
    this.adminSettingsService.updateSettings({
      seperateOrderPerProductCategory: this.seperateOrderPerProductCategory,
      disableProductOnOutOfStock: this.disableProductOnOutOfStock,
      orderCode: this.orderCode,
      pickupOrder: this.pickupOrder,
      orderSound: this.orderSound,
      whileStocksLast: this.whileStocksLast
    }).pipe(first()).subscribe((settings: Settings) => {
      this.seperateOrderPerProductCategory = settings.seperateOrderPerProductCategory;
      this.disableProductOnOutOfStock = settings.disableProductOnOutOfStock;
      this.orderCode = settings.orderCode;
      this.pickupOrder = settings.pickupOrder;
      this.orderSound = settings.orderSound;
      this.whileStocksLast = settings.whileStocksLast;
    });
  }

  onFileSelected() {
    const inputNode: any = document.querySelector('#file');
    if (inputNode.files.length) {

      const [file] = inputNode.files;
      inputNode.value = '';
      this.logo = file;
      this.logoUploadError = false;
      console.log(this.logo);
      // if (typeof (FileReader) !== 'undefined') {
      //   const dataURLReader = new FileReader();
      //   dataURLReader.onload = (e: any) => {
      //     this.logoPreview = e.target.result;
      //   };
      //   dataURLReader.readAsDataURL(file);
      // }

    }
  }

  uploadLogo() {
    console.log(this.logo);
    this.logoUploadError = false;
    this.adminSettingsService.uploadLogo(this.logo).subscribe(
      event => {
        if (event.type == HttpEventType.UploadProgress) {
          if (!this.logoUploadStarted) {
            this.logoUploadStarted = true;
          }
          const percentDone = Math.round(100 * event.loaded / event.total);
          this.logoUploadProgress = percentDone;
          // console.log(`File is ${percentDone}% loaded.`);
        } else if (event instanceof HttpResponse) {
          this.settingsLogo = event.body.filename;
          this.logo = null;
          this.logoPreview = '';
          // console.log('File is completely loaded!');
        }
        // console.log(event);
      },
      (err) => {
        this.logoUploadError = true;
        this.logoUploadStarted = false;
        // console.log("Upload Error:", err);
      }, () => {
        // console.log("Upload done");
        this.logoUploadProgress = 100;
        this.logoUploadStarted = false;
      }
    )
  }

  deleteLogo() {
    this.adminSettingsService.updateSettings({logo: ''}).pipe(first()).subscribe((settings: Settings) => {
      this.settingsLogo  = '';
    });
  }

}
