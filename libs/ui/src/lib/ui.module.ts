import { NgModule } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CallbackFilterPipe } from './callbackFilter.pipe';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [CallbackFilterPipe, ConfirmDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  exports: [CallbackFilterPipe, ConfirmDialogComponent],
  providers: []
})
export class UiModule {}
