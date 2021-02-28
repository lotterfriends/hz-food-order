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

  productsByCategory: {
    category: ProducCategory,
    producs: ViewProduct[]
  }[] = [];


  constructor(
    private adminProductsService: AdminProductsService
  ) { }

  async drop(event: CdkDragDrop<string[]>): Promise<void> {
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
      this.addProductToCategory(product);
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

      const editProductIndex = this.editProducts.findIndex(e => e.id === product.id);
      let categoryChanged = false;
      if (editProductIndex > -1 && result.category?.id !== this.editProducts[editProductIndex].category?.id) {
        categoryChanged = true;
      }
      this.productsByCategory.forEach(pc => {
        const prpductIndex = pc.producs.findIndex(p => p.id === result.id);
        if (prpductIndex > -1) {
          if (categoryChanged) {
            pc.producs.splice(prpductIndex, 1);
            this.addProductToCategory(result);
          } else {
            pc.producs[prpductIndex] = { edit: false, ...result };
          }
        }
      });

      this.editProducts.splice(editProductIndex, 1);
    });
  }

  cancelEdit(product: ViewProduct): void {
    const editProductIndex = this.editProducts.findIndex(e => e.id === product.id);
    if (editProductIndex > -1) {

      this.productsByCategory.forEach(pc => {
        const prpductIndex = pc.producs.findIndex(p => p.id === product.id);
        if (prpductIndex > -1) {
          pc.producs[prpductIndex] = this.editProducts[editProductIndex];
        }
      });

      this.editProducts.splice(editProductIndex, 1);
    }
  }

  clearForm(form: any): void {
    form.reset();
  }

  convertPrice(price: any): number {
    return parseFloat(price);
  }

  addProductToCategory(product: Product): void {
    if (!product.category) {
      product.category = {
        id: -1,
        name: 'Ohne Katergorie',
        order: 100
      };
    }
    const e = this.productsByCategory.find(c => c.category.id === product.category.id);
    if (e) {
      e.producs.push({
        edit: false,
        ...product
      });
    } else {
      this.productsByCategory.push({
        category: product.category,
        producs: [
          {
            edit: false,
            ...product
          }
        ]
      });
    }
  }

  init(): void {
    this.adminProductsService.getProducts().pipe(first()).subscribe(result => {

      for (const item of result) {
        this.addProductToCategory(item);
      }
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
