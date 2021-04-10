import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { first } from 'rxjs/operators';
import { AdminProductsService, ProducCategory, Product } from '../services/admin-products.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface ViewProduct extends Product {
  edit: boolean;
}

interface CatergoryProducts {
  category: ProducCategory;
  producs: ViewProduct[];
}

interface Icon {
  value: string;
}

@Component({
  selector: 'hz-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {

  @ViewChildren(MatTable) table !: QueryList<MatTable<ViewProduct>>;
  categories: ProducCategory[] = [];
  categoryName = '';
  categoryId;
  categoryIcon;
  products: ViewProduct[] = [];
  productName = '';
  productPrice = 0;
  productDesciption = '';
  productStock = 0;
  productCategory: ProducCategory | null = null;
  productsTableColumns = ['name', 'stock', 'price', 'category', 'disableProduct', 'deleteProduct'];
  productsByCategory: CatergoryProducts[] = [];
  expandedElement: ViewProduct | null = null;
  editElement: ViewProduct = { id: -1, category: {id: -1} } as ViewProduct;
  newProductForm: FormGroup | undefined;
  editProductForm: FormGroup | undefined;
  icons: Icon[] = [
    { value: 'restaurant' },
    { value: 'cake' },
    { value: 'restaurant_menu' },
    { value: 'lunch_dining' },
    { value: 'local_cafe' },
    { value: 'fastfood' },
    { value: 'local_bar' },
    { value: 'liquor' },
    { value: 'ramen_dining' },
    { value: 'kitchen' },
    { value: 'emoji_food_beverage' },
    { value: 'local_pizza' },
    { value: 'bakery_dining' },
    { value: 'dinner_dining' },
    { value: 'icecream' },
    { value: 'sports_bar' },
    { value: 'wine_bar' },
  ]

  constructor(
    private adminProductsService: AdminProductsService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.adminProductsService.getProducts().pipe(first()).subscribe(result => {
      for (const item of result) {
        this.addProductToCategory(item);
      }
      this.productsByCategory.sort((a, b) => a.category.order - b.category.order);
      this.productsByCategory.forEach(e => e.producs.sort((a, b) => a.order - b.order));
      this.ref.markForCheck();
    });

    this.adminProductsService.getCategories().pipe(first()).subscribe(result => {
      this.categories = result.sort((a, b) => a.order - b.order);
      if (this.categories.length) {
        this.productCategory = this.categories[0];
      }
      this.ref.markForCheck();
      this.newProductForm = this.createProductForm(null);
    });

    this.editProductForm = this.createProductForm(null);
  }

  async dropCategory(event: CdkDragDrop<string[]>): Promise<void> {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    this.categories.forEach((e, i) => {
      e.order = i;
    });
    await this.adminProductsService.orderCategories(this.categories).toPromise();
  }

  addCategory(): void {
    this.adminProductsService.createCategory({
      name: this.categoryName,
      icon: this.categoryIcon
    } as ProducCategory).pipe(first()).subscribe((product: ProducCategory) => {
      this.categories.push(product);
      this.categoryName = '';
      this.categoryIcon = '';
      this.productCategory = this.categories[0];
      this.ref.detectChanges();
    });
  }

  deleteCategory(category: ProducCategory): void {
    this.adminProductsService.deleteCategory(category).pipe(first()).subscribe(result => {
      this.init();
    });
  }

  editCategory(category: ProducCategory): void {
    this.categoryIcon = category.icon;
    this.categoryName = category.name;
    this.categoryId = category.id;
  }

  saveEditCategory(): void {
    this.adminProductsService.updateCategory({
      id: this.categoryId,
      name: this.categoryName,
      icon: this.categoryIcon
    } as ProducCategory).pipe(first()).subscribe(result => {
      const catIndex = this.categories.findIndex(e => e.id === this.categoryId);
      this.categories[catIndex] = result;
      const pCatIndex = this.productsByCategory.findIndex(e => e.category.id === this.categoryId);
      this.productsByCategory[pCatIndex].category = result;
      this.categoryId = '';
      this.categoryIcon = '';
      this.categoryName = '';
      this.init();
      this.ref.detectChanges();
    });
  }

  cancelCategory(): void {
    this.categoryId = '';
    this.categoryIcon = '';
    this.categoryName = '';
  }

  createProductForm(p: ViewProduct | null): FormGroup {
    return new FormGroup({
      name: new FormControl(p?.name, [
        Validators.required,
        Validators.minLength(4)
      ]),
      description: new FormControl(p?.description),
      stock: new FormControl(p?.stock || 0, Validators.required),
      price: new FormControl(p?.price || 0, [Validators.required]),
      category: new FormControl(p?.category || this.productCategory, Validators.required),
    });
  }

  async dropProduct(event: CdkDragDrop<ViewProduct[]>, catergoryProducts: CatergoryProducts): Promise<void> {
    moveItemInArray(catergoryProducts.producs, event.previousIndex, event.currentIndex);
    catergoryProducts.producs.forEach((e, i) => {
      e.order = i;
    });
    await this.adminProductsService.orderProducs(catergoryProducts.producs).toPromise();
    this.reRenderProductTables();
  }

  addProduct(): void {
    this.adminProductsService.createProduct(
      this.newProductForm?.getRawValue() as Product
    ).pipe(first()).subscribe((product: Product) => {
      this.addProductToCategory(product);
      this.ref.detectChanges();
      this.reRenderProductTables();
    });
  }

  reRenderProductTables(): void {
    this.table.toArray().forEach(data => data.renderRows());
  }

  startEditProduct(product: ViewProduct): void {
    this.editProductForm = this.createProductForm(product);
    this.expandedElement = this.expandedElement?.id === product.id ? null : product;
    this.editElement = { ...product};
    this.ref.detectChanges();
  }

  getProductById(id: number): ViewProduct | null {
    let element = null;
    for (const pc of this.productsByCategory) {
      const result = pc.producs.find(p => p.id === id);
      if (result) {
        element = result;
        break;
      }
    }
    return element;
  }

  saveEditProduct(): void {
    this.adminProductsService.updateProduct(
      this.editElement.id,
      this.editProductForm?.getRawValue() as Product
    ).pipe(first()).subscribe(result => {
      let categoryChanged = false;
      const currentElement = this.getProductById(this.editElement.id);
      if (currentElement && result.category?.id !== currentElement.category?.id) {
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

      this.reRenderProductTables();
      setTimeout(() => {
        this.expandedElement = null;
        this.ref.detectChanges();
      });
    });
  }

  addProductToCategory(product: Product): void {
    if (!product.category) {
      product.category = {
        id: -1,
        icon: '',
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

  categoryCompareFkt(a: ProducCategory, b: ProducCategory): boolean {
    return a && b && a.id === b.id;
  }

  deleteProduct(product: ViewProduct): void {
    this.adminProductsService.deleteProduct(product.id).pipe(first()).subscribe(_ => {
      this.productsByCategory.forEach(pc => {
        const prpductIndex = pc.producs.findIndex(p => p.id === product.id);
        if (prpductIndex > -1) {
          pc.producs.splice(prpductIndex, 1);
        }
      });
      this.reRenderProductTables();
    });
  }

  toggleDisableProduct($event, product: ViewProduct): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.adminProductsService.toggleDisableProduct(product.id, !product.disabled).pipe(first()).subscribe(_ => {
      this.productsByCategory.forEach(pc => {
        const prpductIndex = pc.producs.findIndex(p => p.id === product.id);
        if (prpductIndex > -1) {
          pc.producs[prpductIndex].disabled = !pc.producs[prpductIndex].disabled;
        }
      });
      this.ref.detectChanges();
    });
  }

}
