import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'libs/ui/src/lib/confirm-dialog/confirm-dialog.component';
import { first } from 'rxjs/operators';
import { OrderWSService } from '../order-ws.service';
import { SettingsService } from '../settings.service';
import { Order, OrderProduct, OrderService, OrderStatus, ProducCategory, Product, ServerOrder, Table } from './order.service';

interface CardCategory {
  category: ProducCategory,
  producs: OrderProduct[];
  comment: string;
}

@Component({
  selector: 'hz-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [CurrencyPipe]
})
export class OrderComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    public orderService: OrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private orderWSService: OrderWSService,
    private currencyPipe: CurrencyPipe,
    private renderer: Renderer2,
    private  settingsService: SettingsService
  ) { }

  static readonly MIN_PRODUCT = 0;
  static readonly MAX_PRODUCT = 15;

  orderStatus = OrderStatus;
  orders: ServerOrder[] = [];
  order: Order | false = false;
  seperateOrderPerProductCategory: boolean;
  orderCode: boolean;
  pickupOrder: boolean;
  whileStocksLast: boolean;
  comment = '';
  secret: string | null = '';
  table: Table | undefined;
  sum = 0;
  card: CardCategory[] = [];
  selectedCode: string | false = false;
  products: Product[] = [];
  updateCardAfterPlaceOrder = false;

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
    this.getProducts();
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

    this.orderWSService.tableProductUpdate().subscribe(product => {
      if (this.somethingOrderedForCard()) {
        this.updateCardAfterPlaceOrder = true;
      } else {
        this.getProducts();
      }
    });

    this.orderWSService.isConnected.subscribe(connected => {
      // console.log(`connected: ${connected}`);
      if (connected) {
        setTimeout(() => {
          if (this.secret) {
            this.orderWSService.registerAsTable(this.secret);
          }
        }, 500);
      }
    });

    this.settingsService.getSettings().pipe(first()).subscribe(settings => {
      this.seperateOrderPerProductCategory = settings.seperateOrderPerProductCategory;
      this.orderCode = settings.orderCode;
      this.pickupOrder = settings.pickupOrder;
      this.whileStocksLast = settings.whileStocksLast;
    });

  }

  ngOnDestroy(): void {
    this.closeCode();
  }

  openCode(code: string) {
    this.selectedCode = code;
    this.renderer.addClass(document.body, 'modal-open');
  }

  closeCode() {
    this.selectedCode = false
    this.renderer.removeClass(document.body, 'modal-open');
  }

  getProducts() {
    this.orderService.getProducts().pipe(first()).subscribe(result => {
      this.products = result;
      this.updateCard();
    });
  }

  updateCard() {
    if (this.card.length) {
      this.card = [];
    }
    for (const item of this.products) {
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
          producs: [this.productToOrderProduct(item)],
          comment: ''
        } as CardCategory);
      }
    }
    this.card.sort((a, b) => a.category.order - b.category.order);
    this.card.forEach(e => e.producs.sort((a, b) => a.order - b.order));
  }

  productToOrderProduct(product: Product): OrderProduct {
    return {
      id: product.id,
      name: product.name,
      count: 0,
      price: product.price,
      category: product.category,
      description: product.description,
      stock: product.stock
    } as OrderProduct;
  }


  minus(product: OrderProduct): void {
    if (product.count > OrderComponent.MIN_PRODUCT) {
      product.count--;
    }
    this.sum -= parseFloat(product.price);
  }

  plus(product: OrderProduct): void {
    console.log(product, this.whileStocksLast);
    if (product.count < OrderComponent.MAX_PRODUCT && (!this.whileStocksLast || product.count < product.stock)) {
      product.count++;
      this.sum += parseFloat(product.price);
    }
  }

  somethingOrderedForCard(): boolean {
    for (const cItem of this.card) {
      if (this.somethingOrderedForCategory(cItem)) {
        return true;
      }
    }
    return false;
  }

  somethingOrderedForCategory(category: CardCategory): boolean {
    for (const product of category.producs) {
      if (product.count > 0) {
        return true;
      }
    }
    return false;
  }


  resetProductCountForCategories(categories: CardCategory[]) {
    for (const category of categories) {
      for (const product of category.producs) {
        product.count = 0;
      }
      category.comment = '';
    }
  }

  createOrder(cardCategory: CardCategory[]): Order {
    const order: Order = {items: [], status: OrderStatus.InPreparation};
    for (const cItem of cardCategory) {
      for (const product of cItem.producs) {
        if (product.count > 0) {
          const productIndex = order.items.indexOf(product);
          if (productIndex > -1) {
            order.items[productIndex].count = product.count;
          } else {
            order.items.push({...product});
          }
        }
      }
      if (this.seperateOrderPerProductCategory) {
        order.comment = cItem.comment;
      }
    }
    if (!this.seperateOrderPerProductCategory) {
      order.comment = this.comment;
    }
    return order;
  }

  placeOrder(order: Order, cardCategories: CardCategory[]): void {
    if (order && order.items.length) {
      this.orderService.createOrder(order).pipe(first()).subscribe(serverOrder => {
        this.orders.push(serverOrder);
        this.resetProductCountForCategories(cardCategories);
        this.comment = '';
        this.sum = 0;
      });
    }
    if (this.updateCardAfterPlaceOrder) {
      this.getProducts();
      this.updateCardAfterPlaceOrder = false;
    }
  }

  sendOrder(): void {
    if (!this.somethingOrderedForCard()) {
      this.snackBar.open('Es wurde nichts ausgewählt', 'OK', {
        duration: 2000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Achtung', `Jetzt kostenpflichtig für ${this.currencyPipe.transform(this.sum, 'EUR')} bestellen?`)
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        const order = this.createOrder(this.card);
        this.placeOrder(order, this.card);
      }
    });
  }

  sendOrderForCategory(cardCategory: CardCategory): void  {
    if (!this.somethingOrderedForCategory(cardCategory)) {
      this.snackBar.open('Es wurde nichts ausgewählt', 'OK', {
        duration: 2000,
      });
      return;
    }

    const sum = this.orderService.getSumForProducts(cardCategory.producs);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Achtung', `Jetzt kostenpflichtig für ${this.currencyPipe.transform(sum, 'EUR')} bestellen?`)
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {

        const order: Order = this.createOrder([cardCategory]);
        this.placeOrder(order, [cardCategory]);
      }
    });
  }

  filterFinished(entry: ServerOrder): boolean {
    return entry.status !== OrderStatus.Finished && entry.status !== OrderStatus.Canceled;
  }

  filterByCategory(product: Product, category: ProducCategory): boolean {
    return product.category === category;
  }

  filterProducsWithCount(products: OrderProduct[]) {
    return products.filter(p => p.count > 0);
  }

}
