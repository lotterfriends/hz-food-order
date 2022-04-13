import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrderService, ServerOrder } from '../../order/order.service';
import { AdminOrderService, OrderFilter, TableType } from '../services/admin-order.service';
import { OrderStatus } from '../../order/order.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderMessageDialogComponent } from './order-message-dialog/order-message-dialog';
import { OrderWSService } from '../../order-ws.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, first } from 'rxjs/operators';
import { SettingsService, Settings } from '../../settings.service';
import { AdminTablesService, Table } from '../services/admin-tables.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@hz/ui';
import { AdminProductsService, ProducCategory } from '../services/admin-products.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScrollStateService } from '../../scroll-state.service';

@Component({
  selector: 'hz-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
@UntilDestroy()
export class OrdersComponent implements OnInit {

  orderStatus = OrderStatus;
  tableTypes = TableType;
  orderStatusArray = Object.values(OrderStatus);
  orders: ServerOrder[] = [];
  tables: Table[] = [];
  settings: Settings;
  isInitialFilterInit = false;
  categories:  ProducCategory[];
  filter: OrderFilter;
  oldStatus: Map<string, OrderStatus> = new Map();
  loading = true;
  resultCount = 0;
  skip = 0;
  loadingMore = false;
  searchTid;
  code: string;
  selectedTableLabel = 'Alle Tische';
  @ViewChild('moreSection', { read: ElementRef }) moreSection:ElementRef;

  constructor(
    private adminOrderService: AdminOrderService,
    private adminTableService: AdminTablesService,
    private adminProductsService: AdminProductsService,
    public orderService: OrderService,
    private dialog: MatDialog,
    private wsService: OrderWSService,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private scrollStateService: ScrollStateService
  ) {
    this.initFilter();
  }

  ngOnInit(): void {

    this.settingsService.getSettings().pipe(filter(e => e !== null), first()).subscribe(settings => {
      this.settings = settings;
    });

    this.getOrders();

    this.wsService.orderUpdate().pipe(untilDestroyed(this)).subscribe(order => {
      const index = this.orders.findIndex(e => e.id === order.id);
      if (index > -1) {
        this.orders[index] = order;
      } else {
        this.orders = [ ...this.orders, order].sort((a,b) => new Date(a.created).getTime() - new Date(b.created).getTime());
        this.resultCount++;
      }
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
      });
    } else {
      this.updateFilter();
    }

    this.scrollStateService.onScroll.pipe(untilDestroyed(this)).subscribe(this.onScroll.bind(this));
  }

  private initFilter() {
    if (sessionStorage.getItem('order_filter')) {
      this.filter = JSON.parse(sessionStorage.getItem('order_filter'));
      if (this.filter.code && this.filter.code.length) {
        this.code = this.filter.code;
      }
      this.setSelectedTableLabel();
    } else {
      this.isInitialFilterInit = true;
      this.filter = {
        selectedTable: null,
        displayedCategories: [OrderStatus.InPreparation, OrderStatus.Ready],
      }
    }
  }

  reload() {
    this.updateFilter();
  }

  onScroll(event) {
    // endless loader
    if (this.moreSection) {
      const x = window.innerHeight - this.moreSection.nativeElement.getBoundingClientRect().bottom;
      if (!this.loading && x > -100) {
        this.more();
      }
    }
  }

  private getOrders(append = false) {
    this.loading = true;
    this.adminOrderService.getOrders(this.skip, this.filter).pipe(first()).subscribe(([result, count]) => {
      this.resultCount = count;
      if (append) {
        this.orders = [...this.orders, ...result].sort((a,b) => new Date(a.created).getTime() - new Date(b.created).getTime());
      } else {
        this.orders = result;
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  public more() {
    this.skip += 10;
    this.getOrders(true);
  }

  private updateFilter() {
    sessionStorage.setItem('order_filter', JSON.stringify(this.filter));
    this.skip = 0;
    this.getOrders();
    this.setSelectedTableLabel();
  }

  private _changeStatus(order: ServerOrder, status: OrderStatus, showMessage: boolean = true): void {
    this.oldStatus.set(`order-${order.id}`, order.status);
    this.adminOrderService.changeStatus(order.id, status).pipe(first()).subscribe(result => {
      const eOrder = this.orders.find(e => e.id === result.id);
      if (eOrder) {
        eOrder.status = result.status;
        this.more();
        if (showMessage) {
          const snackBarRef = 
            this.snackBar.open(`Status auf "${this.orderService.getTextForOrderStatus(result.status)}" gesetzt`, 'rückgängig', {
            duration: 4000,
          });
          snackBarRef.onAction().pipe(first()).subscribe(()=> {
            const oldStatus = this.oldStatus.get(`order-${order.id}`);
            this._changeStatus(order, oldStatus, false);
          });
        }
      }
    });
  }

  hasOrders() {
    return this.orders 
      && this.orders.length 
      && this.orders.filter(o => this.filter.displayedCategories.includes(o.status)).length 
      && this.orders.filter(o => this.displayOrderByCategory(o)).length;
  }

  orderTrackByFn(index, item) {
    return item.id;
  }

  orderItemTrackByFn(index, item) {
    return item.id;
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

  isFunnelSelected(funnel: number, category: ProducCategory) {
    return this.filter?.funnels?.length &&  this.filter.funnels.indexOf(`${category.id}-${funnel}`) > -1 ? true : false;
  }

  toggleSelectedProductCategoryFunnel(funnel: number, category: ProducCategory) {
    const entry = `${category.id}-${funnel}`;
    if (this.filter.funnels && this.filter.funnels.length) {
      const index = this.filter.funnels.findIndex(e => e === entry);
      if (index > -1) {
        this.filter.funnels = this.filter.funnels.filter(e => e !== entry);
      } else {
        this.filter.funnels.push(entry)
      }
    } else {
      this.filter.funnels = [entry];
    }
    this.updateFilter();
  }

  selectAll() {
    this.filter.displayedCategories = this.orderStatusArray;
    if (this.settings.seperateOrderPerProductCategory) {
      this.filter.displayedProductCategories = this.categories;
      if (this.categories.length) {
        for (const category of this.categories) {
          if (category.funnels && category.funnels > 1) {
            this.filter.funnels = [];
            for (let index = 1; index <= category.funnels ; index++) {
              this.filter.funnels.push(`${category.id}-${index}`)
            }
          }
        }
      }
    }
    this.updateFilter();
  }

  selectNone() {
    this.filter.displayedCategories = [];
    if (this.settings.seperateOrderPerProductCategory) {
      this.filter.displayedProductCategories = [];
      delete this.filter.funnels;
    }
    this.updateFilter();
  }

  selectTable(table: Table | TableType) {
    this.filter.selectedTable = table;
    this.updateFilter();
  }

  setSelectedTableLabel() {
    if (this.filter.selectedTable && typeof this.filter.selectedTable === 'string' && this.filter.selectedTable === TableType.Even) {
      this.selectedTableLabel ='gerade';
    } else if (this.filter.selectedTable && typeof this.filter.selectedTable === 'string' && this.filter.selectedTable === TableType.Odd) {
      this.selectedTableLabel ='ungerade';
    } else if (this.filter.selectedTable && typeof this.filter.selectedTable === 'object') {
      this.selectedTableLabel = this.filter.selectedTable.name;
    } else {
      this.selectedTableLabel ='Alle Tische';
    }
  }

  selectAllTables() {
    this.filter.selectedTable = null;
    this.updateFilter();
  }

  isAllSelected() {
    this.categories && 
    (this.orderStatusArray && this.filter.displayedCategories &&
    this.orderStatusArray.length === this.filter.displayedCategories.length) &&
      (!this.settings.seperateOrderPerProductCategory || this.filter.displayedProductCategories.length === this.categories.length)
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

  searchByCode() {
    clearTimeout(this.searchTid);
    this.searchTid = setTimeout(() => {
      if (this.code !== this.filter.code) {
        this.filter.code = this.code;
        this.updateFilter();
      }
    }, 500)
  }
  
}
