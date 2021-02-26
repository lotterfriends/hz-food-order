import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';
import { OrderWSService } from '../order-ws.service';
import { Order, OrderMeal, OrderService, OrderStatus, ServerOrder, Table } from './order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, AfterViewInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private orderWSService: OrderWSService
  ) { }

  static readonly MIN_MEAL = 0;
  static readonly MAX_MEAL = 15;
  
  orderStatus = OrderStatus;
  orders: ServerOrder[] = [];
  meals: OrderMeal[] = []
  comment = '';
  secret: string | null = '';
  table: Table | undefined;

  ngOnInit(): void {

    
    this.secret = sessionStorage.getItem('secret');
    if (this.secret) {
      this.orderService.getTabeForSecret(this.secret).subscribe(table => {
        if (table) {
          this.table = table;
        } else {
          this.router.navigate(['/empty']);
        }
      })
    }

    this.orderService.getMeals().subscribe(result => {
      for(const meal of result) {
        this.meals.push({
          id: meal.id,
          name: meal.name,
          count: 0
        })
      }
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
    })
  }

  ngAfterViewInit(): void {
    // after connected event not working
    setTimeout(() => {
      if (this.secret) {
        this.orderWSService.registerAsTable(this.secret);
      }
    }, 1500);
  }

  mealMinus(meal: OrderMeal) {
    if (meal.count > OrderComponent.MIN_MEAL) {
      meal.count--
    }
  }
  
  mealPlus(meal: OrderMeal) {
    if (meal.count < OrderComponent.MAX_MEAL) {
      meal.count++
    }
  }

  somethingOrdered(): boolean {
    for(const meal of this.meals) {
      if (meal.count > 0) {
        return true;
      }
    }
    return false;
  }

  placeOrder() {
    let order: Order = {items: [], status: OrderStatus.InPreparation};
    for(const meal of this.meals) {
      if (meal.count > 0) {
        order.items.push({...meal});
      }
      meal.count = 0;
    }
    order.comment = this.comment;
    this.comment = '';
    if (order.items.length) {
      this.orderService.createOrder(order).pipe(first()).subscribe(serverOrder => {
        this.orders.push(serverOrder);
      })
    }
  }

  sendOrder() {
    if (!this.somethingOrdered()) {
      this.snackBar.open('Es wurde nichts ausgewählt', 'OK', {
        duration: 2000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: new ConfirmDialogModel('Achtung', 'Jetzt Kostenpflichtig bestellen?')
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        this.placeOrder();
      }
    });
  }

  filterFinished(entry: ServerOrder) {
    return entry.status !== OrderStatus.Finished && entry.status !== OrderStatus.Canceled; 
  }

}
