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
  disabled: boolean;
  category: ProducCategory;
  order: number;
}

export interface ProducCategory {
  id: number;
  name: string;
  icon: string;
  description?: string;
  funnels?: number;
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

  createCategory(category: ProducCategory): Observable<ProducCategory> {
    return this.http.post<ProducCategory>(`${environment.apiPath}/product-categories`, category);
  }

  updateCategory(category: ProducCategory) {
    return this.http.put<ProducCategory>(`${environment.apiPath}/product-categories`, category);
  }

  deleteCategory(category: ProducCategory): Observable<ProducCategory> {
    return this.http.delete<ProducCategory>(`${environment.apiPath}/product-categories/${category.id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.apiPath}/products`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiPath}/products/${id}`);
  }
  
  toggleDisableProduct(id: number, disabled: boolean = true): Observable<Product> {
    return this.http.put<Product>(`${environment.apiPath}/products/${id}`, {disabled: disabled});
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${environment.apiPath}/products/${id}`, product);
  }

  orderCategories(categories: ProducCategory[]) {
    return this.http.post<ProducCategory>(`${environment.apiPath}/product-categories/order`, categories.map(e => {
      return {id: e.id, order: e.order};
    }));
  }
  
  orderProducs(products: Product[]) {
    return this.http.post<Product>(`${environment.apiPath}/products/order`, products.map(e => {
      return {id: e.id, order: e.order};
    }));
  }

}
