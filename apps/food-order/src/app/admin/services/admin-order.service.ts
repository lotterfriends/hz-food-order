import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderStatus, ServerOrder } from '../../order/order.service';
import { ProducCategory } from './admin-products.service';
import { Table } from './admin-tables.service';

export enum TableType {
  Even = '_even',
  Odd = '_odd'
}
export interface OrderFilter {
  selectedTable: Table | TableType | null;
  displayedCategories: OrderStatus[];
  displayedProductCategories?: null | ProducCategory[];
  code?: string;
  funnels?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {

  constructor(private http: HttpClient) {}

  getOrders(skip = 0, filter?: OrderFilter): Observable<[ServerOrder[], number]> {
    const query = new URLSearchParams();
    query.append('skip', '' + skip);
    if (filter) {
      if (filter.selectedTable && typeof filter.selectedTable === 'object') {
        query.append('table', '' + filter.selectedTable.id);
      }
      if (filter.selectedTable && typeof filter.selectedTable === 'string') {
        query.append('table', '' + filter.selectedTable);
      }
      if (filter.displayedCategories) {
        query.append('status', filter.displayedCategories.join(','));
      }
      if (filter.displayedProductCategories) {
        query.append('product-categories', filter.displayedProductCategories.map(e => e.id).join(','));
      }
      if (filter.code && filter.code.length) {
        query.append('code', filter.code);
      }
      if (filter.funnels && filter.funnels.length) {
        query.append('funnels', filter.funnels.join(','));
      }
    }
    return this.http.get<[ServerOrder[], number]>(`${environment.apiPath}/orders?${query.toString()}`);
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
