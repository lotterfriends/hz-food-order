import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';
import { OrderWSService } from '../order-ws.service';
import { Order, OrderProduct, OrderService, OrderStatus, ProducCategory, Product, ServerOrder, Table } from './order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [CurrencyPipe]
})
export class OrderComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private orderWSService: OrderWSService,
    private currencyPipe: CurrencyPipe
  ) { }

  static readonly MIN_PRODUCT = 0;
  static readonly MAX_PRODUCT = 15;

  orderStatus = OrderStatus;
  orders: ServerOrder[] = [];
  comment = '';
  secret: string | null = '';
  table: Table | undefined;
  sum = 0;
  card: {
    category: ProducCategory,
    producs: OrderProduct[]
  }[] = [];

  ngOnInit(): void {

    this.secret = sessionStorage.getItem('secret');
    if (this.secret) {
      this.orderService.getTabeForSecret(this.secret).subscribe(table => {
        if (table) {
          this.table = table;
        } else {
          this.router.navigate(['/empty']);
        }
      });
    }

    this.orderService.getProducts().subscribe(result => {
      for (const item of result) {
        if (!item.category) {
          item.category = {
            id: -1,
            name: 'Ohne Katergorie',
            order: 100
          };
        }
        const e = this.card.find(c => c.category.id === item.category.id);
        if (e) {
          e.producs.push(this.productToOrderProduct(item));
        } else {
          this.card.push({
            category: item.category,
            producs: [this.productToOrderProduct(item)]
          });
        }
      }
      this.card.sort((a, b) => a.category.order - b.category.order);
      this.card.forEach(e => e.producs.sort((a, b) => a.order - b.order));
    });

    this.orderService.getOrders().subscribe(result => {
      this.orders = result;
    });

    this.orderWSService.tableOrderUpdate().subscribe(order => {
      const eOrder = this.orders.find(e => e.id === order.id);
      if (eOrder) {
        eOrder.status = order.status;
        eOrder.orderMessage = order.orderMessage;
      }
    });

    this.orderWSService.isConnected.subscribe(connected => {
      if (connected) {
        setTimeout(() => {
          if (this.secret) {
            this.orderWSService.registerAsTable(this.secret);
          }
        }, 500);
      }
    });
  }

  productToOrderProduct(product: Product): OrderProduct {
    return {
      id: product.id,
      name: product.name,
      count: 0,
      price: product.price,
      category: product.category
    } as OrderProduct;
  }


  minus(product: OrderProduct): void {
    if (product.count > OrderComponent.MIN_PRODUCT) {
      product.count--;
    }
    this.sum -= parseFloat(product.price);
  }

  plus(product: OrderProduct): void {
    if (product.count < OrderComponent.MAX_PRODUCT) {
      product.count++;
    }
    this.sum += parseFloat(product.price);
  }

  somethingOrdered(): boolean {
    for (const cItem of this.card) {
      for (const product of cItem.producs) {
        if (product.count > 0) {
          return true;
        }
      }
    }
    return false;
  }

  placeOrder(): void {
    const order: Order = {items: [], status: OrderStatus.InPreparation};
    for (const cItem of this.card) {
      for (const product of cItem.producs) {
        if (product.count > 0) {
          order.items.push({...product});
        }
        product.count = 0;
      }
    }
    order.comment = this.comment;
    this.comment = '';
    this.sum = 0;
    if (order.items.length) {
      this.orderService.createOrder(order).pipe(first()).subscribe(serverOrder => {
        this.orders.push(serverOrder);
      });
    }
  }

  sendOrder(): void {
    if (!this.somethingOrdered()) {
      this.snackBar.open('Es wurde nichts ausgewählt', 'OK', {
        duration: 2000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Achtung', `Jetzt Kostenpflichtig für ${this.currencyPipe.transform(this.sum, 'EUR')} bestellen?`)
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        this.placeOrder();
      }
    });
  }

  filterFinished(entry: ServerOrder): boolean {
    return entry.status !== OrderStatus.Finished && entry.status !== OrderStatus.Canceled;
  }

}
