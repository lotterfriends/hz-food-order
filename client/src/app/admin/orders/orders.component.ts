import { Component, OnInit } from '@angular/core';
import { OrderService, ServerOrder } from 'src/app/order/order.service';
import { AdminService } from '../admin.service';
import { OrderStatus } from '../../order/order.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderMessageDialogComponent } from './order-message-dialog/order-message-dialog';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  orderStatus = OrderStatus;
  orderStatusArray = Object.values(OrderStatus);
  orders: ServerOrder[] = [];

  constructor(
    private adminService: AdminService,
    public orderService: OrderService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.adminService.getOrders().subscribe(result => {
      this.orders = result;
    });
  }

  changeStatus(order: ServerOrder, status: OrderStatus) {
    this.adminService.changeStatus(order.id, status).subscribe(result => {
      const eOrder = this.orders.find(e => e.id === result.id);
      if (eOrder) {
        eOrder.status = result.status;
      }
    })
  }

  openMessageDialog(order: ServerOrder) {
    const dialogRef = this.dialog.open(OrderMessageDialogComponent, {
      maxWidth: "400px",
      data: {order}
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult && dialogResult.trim().length) {
        this.adminService.sendOrderMessage(order.id, dialogResult).subscribe(result => {
          const eOrder = this.orders.find(e => e.id === result.id);
          if (eOrder) {
            eOrder.orderMessage = result.orderMessage;
          }
        })
      }
    });
  }

  filterUnfinished(entry: ServerOrder) {
    return entry.status === OrderStatus.Finished || entry.status === OrderStatus.Canceled; 
  }
  
  filterFinished(entry: ServerOrder) {
    return entry.status !== OrderStatus.Finished && entry.status !== OrderStatus.Canceled; 
  }

}
