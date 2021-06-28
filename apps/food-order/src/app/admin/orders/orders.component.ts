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
  isInitialFilterInit = false;
  categories:  ProducCategory[];
  filter: {
    selectedTable: Table | null,
    displayedCategories: OrderStatus[],
    displayedProductCategories: null | ProducCategory[]
  };

  constructor(
    private adminOrderService: AdminOrderService,
    private adminTableService: AdminTablesService,
    private adminProductsService: AdminProductsService,
    public orderService: OrderService,
    private dialog: MatDialog,
    private wsService: OrderWSService,
    private  settingsService: SettingsService
  ) {
    this.initFilter();
  }

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
        // inital display all
        if (this.isInitialFilterInit) {
          this.filter.displayedProductCategories = categories;
          this.updateFilter();
        }
        console.log(this.filter);
      });
    }
  }

  private initFilter() {
    if (sessionStorage.getItem('order_filter')) {
      this.filter = JSON.parse(sessionStorage.getItem('order_filter'));
    } else {
      this.isInitialFilterInit = true;
      this.filter = {
        selectedTable: null,
        displayedCategories: [OrderStatus.InPreparation, OrderStatus.Ready],
        displayedProductCategories: []
      }
    }
  }

  private updateFilter() {
    sessionStorage.setItem('order_filter', JSON.stringify(this.filter));
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
    if (this.filter.displayedCategories.includes(status)) {
      this.filter.displayedCategories = this.filter.displayedCategories.filter(e => e !== status);
    } else {
      this.filter.displayedCategories.push(status);
    }
    this.updateFilter();
  }

  toggleSelectedProductCategories(category: ProducCategory) {
    if (this.filter.displayedProductCategories.map(e => e.id).includes(category.id)) {
      this.filter.displayedProductCategories = this.filter.displayedProductCategories.filter(e => e.id !== category.id);
    } else {
      this.filter.displayedProductCategories.push(category);
    }
    this.updateFilter();
  }

  selectAll() {
    this.filter.displayedCategories = this.orderStatusArray;
    if (this.settings.seperateOrderPerProductCategory) {
      this.filter.displayedProductCategories = this.categories;
      this.updateFilter();
    }
  }

  selectNone() {
    this.filter.displayedCategories = [];
    if (this.settings.seperateOrderPerProductCategory) {
      this.filter.displayedProductCategories = [];
    }
    this.updateFilter();
  }

  selectTable(table: Table) {
    this.filter.selectedTable = table;
    this.updateFilter();
  }
  
  selectAllTables() {
    this.filter.selectedTable = null;
    this.updateFilter();
  }

  productCategorySelected(category: ProducCategory): boolean {
    return this.filter.displayedProductCategories.map(e => e.id).includes(category.id);
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
    return this.filter.displayedProductCategories.findIndex(e => {
      return order.items[0].product.category.id === e.id
    }) > -1
  }
  
}
