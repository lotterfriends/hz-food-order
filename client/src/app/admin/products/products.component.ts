import { Component, OnInit } from '@angular/core';
import { first, subscribeOn } from 'rxjs/operators';
import { AdminProductsService, Product } from '../services/admin-products.service';

interface ViewProduct extends Product {
  edit: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  products: ViewProduct[] = [];
  editProducts: ViewProduct[] = [];
  productName = '';
  productDesciption = '';
  productStock = 0;


  constructor(
    private adminProductsService: AdminProductsService
  ) { }

  addProduct(): void {
    this.adminProductsService.createProduct({
      name: this.productName,
      stock: this.productStock,
      description: this.productDesciption
    } as Product).pipe(first()).subscribe((product: Product) => {
      this.products.push({ edit: false, ...product});
      this.productName = '';
      this.productDesciption = '';
      this.productStock = 0;
    });
  }

  startEdit(product: ViewProduct): void {
    this.editProducts.push({ ...product});
    product.edit = true;
  }

  saveEdit(product: ViewProduct): void {
    this.adminProductsService.updateProduct(product.id, {
      name: product.name,
      stock: product.stock,
      description: product.description
    } as Product).pipe(first()).subscribe(result => {
      const pIndex = this.products.findIndex(e => e.id === result.id);
      this.products[pIndex] = { edit: false, ...result};
    });
  }

  cancelEdit(product: ViewProduct): void {
    const editProductIndex = this.editProducts.findIndex(e => e.id === product.id);
    if (editProductIndex > -1) {
      const pIndex = this.products.findIndex(e => e.id === this.editProducts[editProductIndex].id);
      this.products[pIndex] = this.editProducts[editProductIndex];
      this.editProducts.splice(editProductIndex, 1);
    }
  }

  clearForm(form: any): void {
    form.reset();
  }

  ngOnInit(): void {
    this.adminProductsService.getProducts().pipe(first()).subscribe(result => {
      this.products = result.map((e) => {
        return {
          edit: false,
          ...e
        };
      });
    });
  }

}
