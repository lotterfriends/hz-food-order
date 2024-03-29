import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Table {
  name: string;
  code: string;
}

export interface Product {
  id: number;
  name: string;
  allergens: string;
  stock: number;
  price: string;
  disabled: boolean;
  order: number;
  category: ProducCategory;
  description: string;
}

export enum OrderStatus {
  InPreparation = 'in-preparation',
  Ready = 'ready',
  Finished = 'finished',
  Canceled = 'canceled',
}

export interface ProducCategory {
  id: number;
  name: string;
  description?: string;
  order: number;
}

export interface OrderProduct {
  id: number;
  name: string;
  allergens: string;
  count: number;
  price: string;
  category: ProducCategory;
  order: number;
  stock: number;
  description: string;
}

export interface Order {
  items: OrderProduct[];
  comment?: string;
  status: OrderStatus;
}

export interface ServerOrder {
  created: string;
  comment: string;
  id: number;
  code: string;
  items: {
    count: number;
    id: number;
    product: OrderProduct
  }[];
  orderMessage: string;
  status: OrderStatus;
  table: {
    id: number;
    name: string;
  };

}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {}

  createOrder(order: Order): Observable<ServerOrder> {
    return this.http.post<ServerOrder>(`${environment.apiPath}/table-orders`, order);
  }

  getOrders(): Observable<ServerOrder[]> {
    return this.http.get<ServerOrder[]>(`${environment.apiPath}/table-orders`);
  }

  getTabeForSecret(secret: string): Observable<Table> {
    return this.http.get<Table>(`${environment.apiPath}/table-orders/${secret}`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiPath}/table-orders/products`);
  }

  getTextForOrderStatus(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.InPreparation:
        return 'Wird zubereitet';
      case OrderStatus.Ready:
        return 'Fertig';
      case OrderStatus.Canceled:
        return 'Abgebrochen';
      case OrderStatus.Finished:
        return 'Bezahlt';
      default:
        return 'unbekannter Status';
    }
  }

  getSum(order: ServerOrder): number {
    let sum = 0;
    for (const item of order.items) {
      sum += parseFloat(item.product.price) * item.count;
    }
    return sum;
  }

  getSumForProducts(products: OrderProduct[]): number {
    let sum = 0;
    for (const item of products) {
      sum += parseFloat(item.price) * item.count;
    }
    return sum;
  }

}
