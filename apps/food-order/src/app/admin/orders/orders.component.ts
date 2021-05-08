import { Component, OnInit } from '@angular/core';
import { OrderService, ServerOrder } from '../../order/order.service';
import { AdminOrderService } from '../services/admin-order.service';
import { OrderStatus } from '../../order/order.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderMessageDialogComponent } from './order-message-dialog/order-message-dialog';
import { OrderWSService } from '../../order-ws.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first } from 'rxjs/operators';
import { SettingsService, Settings } from '../../settings.service';
import { AdminTablesService, Table } from '../services/admin-tables.service';

@Component({
  selector: 'hz-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
@UntilDestroy()
export class OrdersComponent implements OnInit {

  orderStatus = OrderStatus;
  orderStatusArray = Object.values(OrderStatus);
  orders: ServerOrder[] = [];
  tables: Table[] = [];
  settings: Settings;
  selectedTable: Table | null = null;
  displayedCategories = [OrderStatus.InPreparation, OrderStatus.Ready];

  constructor(
    private adminOrderService: AdminOrderService,
    private adminTableService: AdminTablesService,
    public orderService: OrderService,
    private dialog: MatDialog,
    private wsService: OrderWSService,
    private  settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();

    this.adminOrderService.getOrders().pipe(first()).subscribe(result => {
      this.orders = result;
    });

    this.wsService.orderUpdate().pipe(untilDestroyed(this)).subscribe(order => {
      this.orders = [ ...this.orders, order];
    });

    this.adminTableService.getTables().pipe(first()).subscribe(tables => {
      this.tables = tables;
    });

  }


  changeStatus(order: ServerOrder, status: OrderStatus): void {
    this.adminOrderService.changeStatus(order.id, status).pipe(first()).subscribe(result => {
      const eOrder = this.orders.find(e => e.id === result.id);
      if (eOrder) {
        eOrder.status = result.status;
      }
    });
  }

  openMessageDialog(order: ServerOrder): void {
    const dialogRef = this.dialog.open(OrderMessageDialogComponent, {
      maxWidth: '400px',
      data: {order}
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult && dialogResult.trim().length) {
        this.adminOrderService.sendOrderMessage(order.id, dialogResult).pipe(first()).subscribe(result => {
          const eOrder = this.orders.find(e => e.id === result.id);
          if (eOrder) {
            eOrder.orderMessage = result.orderMessage;
          }
        });
      }
    });
  }

  toggleStatusSelection(status: OrderStatus) {
    if (this.displayedCategories.includes(status)) {
      this.displayedCategories = this.displayedCategories.filter(e => e !== status);
    } else {
      this.displayedCategories.push(status);
    }
  }

  filterUnfinished(entry: ServerOrder): boolean {
    return entry.status === OrderStatus.Finished || entry.status === OrderStatus.Canceled;
  }

  filterFinished(entry: ServerOrder): boolean {
    return entry.status !== OrderStatus.Finished && entry.status !== OrderStatus.Canceled;
  }
  
}
