import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Order, OrderStatus, ServerOrder } from "../order/order.service";

export interface Table {
  id: number;
  name:string;
  code: string;
  secret: string;
}

export interface Meal {
  id: number;
  name:string;
  stock: number;
  description?: string;
}

export interface Settings {
  secret: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {}


  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${environment.apiPath}/tables`)
  }

  createTable(name:string): Observable<Table> {
    return this.http.post<Table>(`${environment.apiPath}/tables`, { name });
  }
  
  getMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${environment.apiPath}/meals`)
  }

  createMeal(meal: Meal): Observable<Meal> {
    return this.http.post<Meal>(`${environment.apiPath}/meals`, meal);
  }
  
  updateMeal(id: number, meal: Meal): Observable<Meal> {
    return this.http.put<Meal>(`${environment.apiPath}/meals/${id}`, meal);
  }

  getOrders(): Observable<ServerOrder[]> {
    return this.http.get<ServerOrder[]>(`${environment.apiPath}/orders`)
  }

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(`${environment.apiPath}/settings`)
  }
  
  updateSecret(secret: string): Observable<Settings> {
    return this.http.put<Settings>(`${environment.apiPath}/settings/update-secret`, {secret});
  }

  getNewSecret(): Observable<{secret: string}> {
    return this.http.get<{secret: string}>(`${environment.apiPath}/settings/random`);
  }

  changeStatus(orderId: number, status: OrderStatus): Observable<ServerOrder> {
    return this.http.post<ServerOrder>(`${environment.apiPath}/orders/change-status/${orderId}`, { status });
  }
  
  sendOrderMessage(orderId: number, message: string): Observable<ServerOrder> {
    return this.http.post<ServerOrder>(`${environment.apiPath}/orders/message/${orderId}`, { message });
  }

  renameTable(tableId: number, name: string): Observable<Table> {
    return this.http.post<Table>(`${environment.apiPath}/tables/${tableId}/rename`, { name });;
  }

}