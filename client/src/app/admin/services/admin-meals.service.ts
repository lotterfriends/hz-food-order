import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { OrderStatus, ServerOrder } from "../../order/order.service";

export interface Meal {
  id: number;
  name:string;
  stock: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminMealsService {

  constructor(private http: HttpClient) {}

  getMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${environment.apiPath}/meals`)
  }

  createMeal(meal: Meal): Observable<Meal> {
    return this.http.post<Meal>(`${environment.apiPath}/meals`, meal);
  }
  
  updateMeal(id: number, meal: Meal): Observable<Meal> {
    return this.http.put<Meal>(`${environment.apiPath}/meals/${id}`, meal);
  }

}