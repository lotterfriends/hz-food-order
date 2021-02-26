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
  category: ProducCategory
}

export interface ProducCategory {
  id: number;
  name: string;
  description?: string;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductsService {

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiPath}/products`);
  }

  getCategories(): Observable<ProducCategory[]> {
    return this.http.get<ProducCategory[]>(`${environment.apiPath}/product-categories`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.apiPath}/products`, product);
  }

  createCategory(category: ProducCategory): Observable<ProducCategory> {
    return this.http.post<ProducCategory>(`${environment.apiPath}/product-categories`, category);
  }
  
  deleteCategory(category: ProducCategory): Observable<ProducCategory> {
    return this.http.delete<ProducCategory>(`${environment.apiPath}/product-categories/${category.id}`);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${environment.apiPath}/products/${id}`, product);
  }

  orderCategories(categories: ProducCategory[]) {
    return this.http.post<ProducCategory>(`${environment.apiPath}/product-categories/order`, categories.map(e => {
      return {id: e.id, order: e.order}
    }));
  }

}
