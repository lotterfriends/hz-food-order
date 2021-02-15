import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Table {
  name:string;
  code: string;
}

export interface Meal {
  id: number;
  name:string;
  stock: number;
}

export enum OrderStatus {
  InPreparation = 'in-preparation',
  ReadyForPickup = 'ready-for-pickup',
  Finished = 'finished',
  Canceled = 'canceled',
}

export interface OrderMeal {
  name: string;
  count: number;
}

export interface Order {
  items: OrderMeal[];
  comment?: string;
  status: OrderStatus;
}

export interface ServerOrder {
  comment: string;
  id: number;
  items:{
    count: number;
    id: number;
    meal: {
      name: string;
      description: string;
    }
  }[];
  orderMessage: string;
  status: OrderStatus;
  table: {
    id: number;
    name: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {}


  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${environment.apiPath}/tables`)
  }

  createTable(name:string, code:string): Observable<Table> {
    return this.http.post<Table>(`${environment.apiPath}/tables`, { name, code});
  }
  
  getMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${environment.apiPath}/meals`)
  }

  createMeal(name:string, stock:number): Observable<Meal> {
    return this.http.post<Meal>(`${environment.apiPath}/meals`, { name, stock});
  }

  createOrder(order: Order): Observable<ServerOrder> {
    return this.http.post<ServerOrder>(`${environment.apiPath}/table-orders`, order);
  }

  getOrders(): Observable<ServerOrder[]> {
    return this.http.get<ServerOrder[]>(`${environment.apiPath}/table-orders`)
  }

  getTabeForSecret(secret: string): Observable<Table> {
    return this.http.get<Table>(`${environment.apiPath}/tables/${secret}`)
  }

  getTextForOrderStatus(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.InPreparation:
        return 'Wird zubereitet';
      case OrderStatus.ReadyForPickup:
        return 'Bereit zum abholen';
      case OrderStatus.Canceled:
        return 'Abgebrochen';
      case OrderStatus.Finished:
        return 'Abgeschlossen';
      default:
        return 'unbekannter Status';
    }
  }


}