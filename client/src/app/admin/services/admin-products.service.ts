import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductsService {

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiPath}/products`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.apiPath}/products`, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${environment.apiPath}/products/${id}`, product);
  }

}
