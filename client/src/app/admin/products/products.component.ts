import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { AdminProductsService, ProducCategory, Product } from '../services/admin-products.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

interface ViewProduct extends Product {
  edit: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  categories: ProducCategory[] = [];
  categoryName = '';

  products: ViewProduct[] = [];
  editProducts: ViewProduct[] = [];
  productName = '';
  productPrice = 0;
  productDesciption = '';
  productStock = 0;
  productCategory: ProducCategory | null = null;

  constructor(
    private adminProductsService: AdminProductsService
  ) { }

  async drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    this.categories.forEach((e, i) => {
      e.order = i;
    });
    await this.adminProductsService.orderCategories(this.categories).toPromise();
  }

  addCategory(): void {
    this.adminProductsService.createCategory({
      name: this.categoryName
    } as ProducCategory).pipe(first()).subscribe((product: ProducCategory) => {
      this.categories.push(product);
      this.categoryName = '';
      this.productCategory = this.categories[0];
    });
  }

  addProduct(): void {
    this.adminProductsService.createProduct({
      name: this.productName,
      stock: this.productStock,
      price: this.productPrice,
      description: this.productDesciption,
      category: this.productCategory
    } as Product).pipe(first()).subscribe((product: Product) => {
      this.products.push({ edit: false, ...product});
      this.productName = '';
      this.productDesciption = '';
      this.productStock = 0;
      this.productPrice = 0;
      if (this.categories.length) {
        this.productCategory = this.categories[0];
      }
    });
  }

  startEdit(product: ViewProduct): void {
    console.log(product);
    this.editProducts.push({ ...product});
    product.edit = true;
  }

  saveEdit(product: ViewProduct): void {
    this.adminProductsService.updateProduct(product.id, {
      name: product.name,
      stock: product.stock,
      price: product.price,
      description: product.description,
      category: product.category
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

  convertPrice(price: any): number {
    return parseFloat(price);
  }

  init() {
    this.adminProductsService.getProducts().pipe(first()).subscribe(result => {
      this.products = result.map((e) => {
        return {
          edit: false,
          ...e
        };
      });
    });

    this.adminProductsService.getCategories().pipe(first()).subscribe(result => {
      this.categories = result.sort((a, b) => a.order - b.order);
      if (this.categories.length) {
        this.productCategory = this.categories[0];
      }
    });
  }

  ngOnInit(): void {
    this.init();
  }

  categoryCompareFkt(a: ProducCategory, b: ProducCategory): boolean {
    return a.id === b.id;
  }

  deleteCategory(category: ProducCategory): void {
    this.adminProductsService.deleteCategory(category).pipe(first()).subscribe(result => {
      this.init();
    });
  }

}
