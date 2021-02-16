import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Order, OrderStatus, ServerOrder } from "../../order/order.service";

export interface Table {
  id: number;
  name:string;
  code: string;
  secret: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminTablesService {

  constructor(private http: HttpClient) {}

  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${environment.apiPath}/tables`)
  }

  createTable(name:string): Observable<Table> {
    return this.http.post<Table>(`${environment.apiPath}/tables`, { name });
  }

  renameTable(tableId: number, name: string): Observable<Table> {
    return this.http.post<Table>(`${environment.apiPath}/tables/${tableId}/rename`, { name });;
  }

}