import { NgModule } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CallbackFilterPipe } from './callbackFilter.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [CallbackFilterPipe, ConfirmDialogComponent],
  imports: [CommonModule],
  exports: [CallbackFilterPipe, ConfirmDialogComponent],
  providers: []
})
export class UiModule {}
