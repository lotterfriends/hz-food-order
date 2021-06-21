import { Component, OnInit } from '@angular/core';
import { OrderService, ProducCategory, ServerOrder } from '../../order/order.service';
import { AdminOrderService } from '../services/admin-order.service';
import { OrderStatus } from '../../order/order.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderMessageDialogComponent } from './order-message-dialog/order-message-dialog';
import { OrderWSService } from '../../order-ws.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, first } from 'rxjs/operators';
import { SettingsService, Settings } from '../../settings.service';
import { AdminTablesService, Table } from '../services/admin-tables.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'libs/ui/src/lib/confirm-dialog/confirm-dialog.component';
import { AdminProductsService } from '../services/admin-products.service';

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
  displayedProductCategories: ProducCategory[] = [];
  categories:  ProducCategory[];

  constructor(
    private adminOrderService: AdminOrderService,
    private adminTableService: AdminTablesService,
    private adminProductsService: AdminProductsService,
    public orderService: OrderService,
    private dialog: MatDialog,
    private wsService: OrderWSService,
    private  settingsService: SettingsService
  ) { }

  ngOnInit(): void {

    this.settingsService.getSettings().pipe(filter(e => e !== null), first()).subscribe(settings => {
      this.settings = settings;
    })

    this.adminOrderService.getOrders().pipe(first()).subscribe(result => {
      this.orders = result;
    });

    this.wsService.orderUpdate().pipe(untilDestroyed(this)).subscribe(order => {
      this.orders = [ ...this.orders, order];
    });

    this.adminTableService.getTables().pipe(first()).subscribe(tables => {
      this.tables = tables;
    });

    if (this.settings.seperateOrderPerProductCategory) {
      this.adminProductsService.getCategories().pipe(first()).subscribe(categories => {
        this.categories = categories;
        this.displayedProductCategories = categories;
      });
    }
  }

  private _changeStatus(order: ServerOrder, status: OrderStatus): void {
    this.adminOrderService.changeStatus(order.id, status).pipe(first()).subscribe(result => {
      const eOrder = this.orders.find(e => e.id === result.id);
      if (eOrder) {
        eOrder.status = result.status;
      }
    });
  }


  changeStatus(order: ServerOrder, status: OrderStatus): void {
    if (status === OrderStatus.Canceled) {
    
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel('Achtung', 'Wollen Sie die Bestellung wirklich abbrechen? Die Bestellung verschwindet beim Kunden.')
      });
  
      dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
        if (dialogResult) {
          this._changeStatus(order, status);
        }
      });

    } else {
      this._changeStatus(order, status);
    }
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

  toggleSelectedProductCategories(category: ProducCategory) {
    if (this.displayedProductCategories.includes(category)) {
      this.displayedProductCategories = this.displayedProductCategories.filter(e => e.id !== category.id);
    } else {
      this.displayedProductCategories.push(category);
    }
  }

  selectAll() {
    this.displayedCategories = this.orderStatusArray;
    if (this.settings.seperateOrderPerProductCategory) {
      this.displayedProductCategories = this.categories;
    }
  }

  selectNone() {
    this.displayedCategories = [];
    if (this.settings.seperateOrderPerProductCategory) {
      this.displayedProductCategories = [];
    }
  }

  filterUnfinished(entry: ServerOrder): boolean {
    return entry.status === OrderStatus.Finished || entry.status === OrderStatus.Canceled;
  }

  filterFinished(entry: ServerOrder): boolean {
    return entry.status !== OrderStatus.Finished && entry.status !== OrderStatus.Canceled;
  }

  displayOrderByCategory(order: ServerOrder): boolean {
    if (!this.settings.seperateOrderPerProductCategory) {
      return true;
    }
    if (!order.items.length) {
      return false;
    }
    return this.displayedProductCategories.findIndex(e => {
      return order.items[0].product.category.id === e.id
    }) > -1
  }
  
}
