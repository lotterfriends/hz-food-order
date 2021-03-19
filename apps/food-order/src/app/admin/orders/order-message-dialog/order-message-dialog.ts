import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServerOrder } from '../../../order/order.service';

@Component({
  selector: 'hz-order-message-dialog',
  templateUrl: './order-message-dialog.html',
  styleUrls: []
})
export class OrderMessageDialogComponent {

  message = '';

  constructor(
    public dialogRef: MatDialogRef<OrderMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {order: ServerOrder}
  ) {
    this.message = data.order.orderMessage;
  }

  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(this.message);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close();
  }
}
