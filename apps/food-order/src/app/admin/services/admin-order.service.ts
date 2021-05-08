import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderStatus, ServerOrder } from '../../order/order.service';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {

  constructor(private http: HttpClient) {}

  getOrders(): Observable<ServerOrder[]> {
    return this.http.get<ServerOrder[]>(`${environment.apiPath}/orders`);
  }

  changeStatus(orderId: number, status: OrderStatus): Observable<ServerOrder> {
    return this.http.post<ServerOrder>(`${environment.apiPath}/orders/change-status/${orderId}`, { status });
  }

  sendOrderMessage(orderId: number, message: string): Observable<ServerOrder> {
    return this.http.post<ServerOrder>(`${environment.apiPath}/orders/message/${orderId}`, { message });
  }

  archive(): Observable<ServerOrder> {
    return this.http.post<ServerOrder>(`${environment.apiPath}/orders/archive`, {});
  }

}
