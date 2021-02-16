import { AfterViewInit, Component, OnInit } from '@angular/core';
import { OrderService, ServerOrder } from 'src/app/order/order.service';
import { AdminOrderService } from '../services/admin-order.service';
import { OrderStatus } from '../../order/order.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderMessageDialogComponent } from './order-message-dialog/order-message-dialog';
import { OrderWSService } from 'src/app/order-ws.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
@UntilDestroy()
export class OrdersComponent implements OnInit, AfterViewInit {

  orderStatus = OrderStatus;
  orderStatusArray = Object.values(OrderStatus);
  orders: ServerOrder[] = [];

  constructor(
    private adminService: AdminOrderService,
    public orderService: OrderService,
    private dialog: MatDialog,
    private wsService: OrderWSService
  ) { }

  ngOnInit(): void {
    this.adminService.getOrders().pipe(first()).subscribe(result => {
      this.orders = result;
    });

    this.wsService.orderUpdate().pipe(untilDestroyed(this)).subscribe(order => {
      this.orders = [ ...this.orders, order];
    });
  }

  ngAfterViewInit(): void {
    // after connected event not working
    setTimeout(() => {
      this.wsService.registerAsUser();
    }, 1500);
  }

  changeStatus(order: ServerOrder, status: OrderStatus) {
    this.adminService.changeStatus(order.id, status).pipe(first()).subscribe(result => {
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

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult && dialogResult.trim().length) {
        this.adminService.sendOrderMessage(order.id, dialogResult).pipe(first()).subscribe(result => {
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
