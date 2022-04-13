import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { filter, first } from 'rxjs/operators';
import { AdminProductsService, ProducCategory, Product } from '../services/admin-products.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@hz/ui';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Settings } from '../services/admin-settings.service';
import { SettingsService } from '../../settings.service';
import { Role } from '../../auth.service';

interface ViewProduct extends Product {
  edit: boolean;
}

interface CategoryProducts {
  category: ProducCategory;
  products: ViewProduct[];
  datasource: MatTableDataSource<ViewProduct>
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
export class ProductsComponent implements OnInit, AfterViewInit {

  @ViewChildren(MatTable) table !: QueryList<MatTable<ViewProduct>>;
  allRoles = Role;
  sortCategoriesDisabled = true;
  sortProductsDisabled = true;
  categories: ProducCategory[] = [];
  categoryName = '';
  categoryId;
  
  categoryFunnels;
  settings: Settings;
  products: ViewProduct[] = [];
  productName = '';
  productPrice = 0;
  productDesciption = '';
  productStock = 0;
  productCategory: ProducCategory | null = null;
  productsTableColumns = ['name', 'stock', 'price', 'category', 'disableProduct', 'deleteProduct'];
  productsByCategory: CategoryProducts[] = [];
  expandedElement: ViewProduct | null = null;
  editElement: ViewProduct = { id: -1, category: {id: -1} } as ViewProduct;
  newProductForm: FormGroup | undefined;
  showTable = false;
  hideEdit = true;
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
  ];
  categoryIcon = this.icons[0].value;

  constructor(
    private adminProductsService: AdminProductsService,
    private ref: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private settingsService: SettingsService
  ) { }
  
  ngAfterViewInit(): void {
    this.showTable = true;
  }

  ngOnInit(): void {
    this.init();
  }

  init(): void {

    this.settingsService.getSettings().pipe(filter(e => e !== null), first()).subscribe(settings => {
      this.settings = settings;
    });

    const products$ = this.adminProductsService.getProducts();
    const categories$ = this.adminProductsService.getCategories();
    this.editProductForm = this.createProductForm(null);

    combineLatest([products$, categories$]).pipe(first()).subscribe(([products, categories]) => {
      for (const product of products) {
        this.addProductToCategory(product);
      }
      this.productsByCategory.sort((a, b) => a.category.order - b.category.order);
      this.productsByCategory.forEach(e => e.products.sort((a, b) => a.order - b.order));
      
      this.categories = categories.sort((a, b) => a.order - b.order);
      if (this.categories.length) {
        this.productCategory = this.categories[0];
      }
      this.newProductForm = this.createProductForm(null);
      this.ref.markForCheck();
    });
  }

  async dropCategory(event: CdkDragDrop<string[]>): Promise<void> {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    this.categories.forEach((e, i) => {
      e.order = i;
    });
    await this.adminProductsService.orderCategories(this.categories).toPromise();
  }

  addCategory(): void {
    const obj = {
      name: this.categoryName,
      icon: this.categoryIcon,
      funnels: this.categoryFunnels
    } as ProducCategory;
    if (!obj.funnels) {
      delete obj.funnels;
    }
    this.adminProductsService.createCategory(obj).pipe(first()).subscribe((product: ProducCategory) => {
      this.categories.push(product);
      this.categoryName = '';
      this.categoryIcon = this.icons[0].value;
      this.categoryFunnels = '';
      this.productCategory = this.categories[0];
      this.snackBar.open(`Das Kategorie wurde angelegt`, 'OK', {
        duration: 4000,
      });
      this.ref.detectChanges();
    });
  }

  private reassignProductsOfDeletedCategory(category) {
    const pCatIndex = this.productsByCategory.findIndex(e => e.category.id === category.id);
    if (this.productsByCategory[pCatIndex].products.length) {
      const products = [ ...this.productsByCategory[pCatIndex].products];
      this.productsByCategory = this.productsByCategory.filter(e => e.category.id !== category.id);
      const pUnCatIndex = this.productsByCategory.findIndex(e => e.category.id === AdminProductsService.DUMMY_CATEGORY.id);
      if (pUnCatIndex > -1) {
        this.productsByCategory[pUnCatIndex].products = [
          ...products,
          ...this.productsByCategory[pUnCatIndex].products
        ];
        this.productsByCategory[pUnCatIndex].datasource.data = this.productsByCategory[pUnCatIndex].products;
      } else {
        for (const product of products) {
          delete product.category;
          this.addProductToCategory(product);
        }
      }
    }
  }

  async refreshProducs(): Promise<void> {
    return new Promise<void>(resolve => {
      this.productsByCategory = [];
      this.adminProductsService.getProducts().pipe(first()).subscribe(products => {
        for (const product of products) {
          this.addProductToCategory(product);
        }
        this.productsByCategory.sort((a, b) => a.category.order - b.category.order);
        this.productsByCategory.forEach(e => e.products.sort((a, b) => a.order - b.order));
        resolve();
      });
    });
  }

  deleteCategory(event, category: ProducCategory): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(null, `Wollen sie die Kategorie "${category.name}" wirklich löschen?`)
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        this.adminProductsService.deleteCategory(category).pipe(first()).subscribe(() => {
          this.reassignProductsOfDeletedCategory(category);
          const snackBarRef = this.snackBar.open(`Die Katergorie ${category.name} wurde erfolgreich gelöscht.`, 'rückgängig', {
            duration: 4000,
          });
          snackBarRef.onAction().subscribe(()=> {
            this.adminProductsService.restoreProductCategory(category.id).pipe(first()).subscribe(async category => {
              this.categories.push(category);
              await this.refreshProducs();
              this.reRenderProductTables();
              this.ref.detectChanges();
            });
          });

          this.categories = this.categories.filter(e => e.id !== category.id);
          this.reRenderProductTables();
          this.ref.detectChanges();
        });
      }
    });
  }

  editCategory(category: ProducCategory): void {
    this.categoryIcon = category.icon;
    this.categoryName = category.name;
    this.categoryId = category.id;
    this.categoryFunnels = category.funnels;
  }

  toggleDisableProductCategory($event, category: ProducCategory): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.adminProductsService.toggleDisableProductCategory(category.id, !category.disabled).pipe(first()).subscribe(() => {
      const index = this.categories.findIndex(p => p.id === category.id);
      if (index > -1) {
        this.categories[index].disabled = !this.categories[index].disabled;
      }
      this.ref.detectChanges();
    });
  }

  saveEditCategory(): void {
    this.adminProductsService.updateCategory({
      id: this.categoryId,
      name: this.categoryName,
      icon: this.categoryIcon,
      funnels: this.categoryFunnels
    } as ProducCategory).pipe(first()).subscribe(result => {
      const catIndex = this.categories.findIndex(e => e.id === this.categoryId);
      this.categories[catIndex] = result;
      const pCatIndex = this.productsByCategory.findIndex(e => e.category.id === this.categoryId);
      this.productsByCategory[pCatIndex].category = result;
      this.categoryId = '';
      this.categoryIcon = '';
      this.categoryName = '';
      this.categoryFunnels = '';
      this.init();
      this.ref.detectChanges();
    });
  }

  cancelCategory(): void {
    this.categoryId = '';
    this.categoryIcon = this.icons[0].value;
    this.categoryName = '';
    this.categoryFunnels = '';
  }

  createProductForm(p: ViewProduct | null): FormGroup {
    return new FormGroup({
      id: new FormControl(p?.id || 'new', Validators.required),
      name: new FormControl(p?.name, [
        Validators.required,
        Validators.minLength(2)
      ]),
      description: new FormControl(p?.description),
      allergens: new FormControl(p?.allergens),
      stock: new FormControl(p?.stock || 0, Validators.required),
      price: new FormControl(p?.price || 0, [Validators.required]),
      category: new FormControl(p?.category && p?.category.id > -1 ? p?.category : this.productCategory, Validators.required),
    });
  }

  async dropProduct(event: CdkDragDrop<ViewProduct[]>, categoryProducts: CategoryProducts): Promise<void> {
    
    if (event.previousContainer === event.container) {
      moveItemInArray(categoryProducts.products, event.previousIndex, event.currentIndex);
      categoryProducts.products.forEach((e, i) => {
        e.order = i;
      });
      await this.adminProductsService.orderProducts(categoryProducts.products).toPromise();
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      const product = event.item.data as ViewProduct;
      product.category = categoryProducts.category;
      categoryProducts.products.forEach((e, i) => {
        e.order = i;
      });
      await this.saveEditProduct(product, false);
      await this.adminProductsService.orderProducts(categoryProducts.products).toPromise();
    }
    this.reRenderProductTables();
  }

  addProduct(): void {
    const product = this.newProductForm?.getRawValue() as Product;
    delete product.id;
    this.adminProductsService.createProduct(
      product
    ).pipe(first()).subscribe((product: Product) => {
      this.newProductForm = this.createProductForm(null);
      this.addProductToCategory(product);
      this.ref.detectChanges();
      this.reRenderProductTables();
      this.snackBar.open(`Das Produkt wurde angelegt`, 'OK', {
        duration: 4000,
      });
    });
  }

  reRenderProductTables(): void {
    this.table.toArray().forEach(data => data.renderRows());
    this.ref.detectChanges();
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
      const result = pc.products.find(p => p.id === id);
      if (result) {
        element = result;
        break;
      }
    }
    return element;
  }

  saveEditProduct(product?: Product | ViewProduct, rerender = true): void {
    if (!product) {
      product = this.editProductForm?.getRawValue() as Product;
    }
    if ('edit' in product) {
      delete product.edit;
    }
    this.adminProductsService.updateProduct(
      product.id,
      product
    ).pipe(first()).subscribe(result => {
      let categoryChanged = false;
      const currentElement = this.getProductById(product.id);
      if (currentElement && result.category?.id !== currentElement.category?.id) {
        categoryChanged = true;
      }
      this.productsByCategory.forEach(pc => {
        const prpductIndex = pc.products.findIndex(p => p.id === result.id);
        if (prpductIndex > -1) {
          if (categoryChanged) {
            pc.products.splice(prpductIndex, 1);
            this.addProductToCategory(result);
          } else {
            pc.products[prpductIndex] = { edit: false, ...result };
          }
        }
      });

      if (rerender) {
        this.reRenderProductTables();
        setTimeout(() => {
          this.expandedElement = null;
          this.ref.detectChanges();
        });
      }
    });
  }

  addProductToCategory(product: Product): void {
    if (!product.category) {
      product.category = { ...AdminProductsService.DUMMY_CATEGORY};
    }
    const e = this.productsByCategory.find(c => c.category.id === product.category.id);
    if (e) {
      e.products.push({
        edit: false,
        ...product
      });
    } else {
      const viewProducts =  [
        {
          edit: false,
          ...product
        }
      ];
      this.productsByCategory.push({
        category: product.category,
        products: viewProducts,
        datasource: new MatTableDataSource(viewProducts)
      });
    }
  }

  categoryCompareFkt(a: ProducCategory, b: ProducCategory): boolean {
    return a && b && a.id === b.id;
  }

  deleteProduct(event, product: ViewProduct): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(null, `Wollen sie die Produkt "${product.name}" wirklich löschen?`)
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        this.adminProductsService.deleteProduct(product.id).pipe(first()).subscribe(() => {
          this.productsByCategory.forEach(pc => {
            const prpductIndex = pc.products.findIndex(p => p.id === product.id);
            if (prpductIndex > -1) {
              pc.products.splice(prpductIndex, 1);
              if (!pc.products.length) {
                this.productsByCategory = this.productsByCategory.filter(e => e.category.id !== pc.category.id); 
              }
            }
          });
          this.reRenderProductTables();

          const snackBarRef = this.snackBar.open(`Das Produkt ${product.name} wurde erfolgreich gelöscht.`, 'rückgängig', {
            duration: 4000,
          });
          snackBarRef.onAction().subscribe(()=> {
            this.adminProductsService.restoreProduct(product.id).pipe(first()).subscribe(product => {
              this.addProductToCategory(product);
              this.reRenderProductTables();
            });
          });
        });
      }
    });

    
  }

  toggleDisableProduct($event, product: ViewProduct): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.adminProductsService.toggleDisableProduct(product.id, !product.disabled).pipe(first()).subscribe(() => {
      this.productsByCategory.forEach(pc => {
        const prpductIndex = pc.products.findIndex(p => p.id === product.id);
        if (prpductIndex > -1) {
          pc.products[prpductIndex].disabled = !pc.products[prpductIndex].disabled;
        }
      });
      this.ref.detectChanges();
    });
  }

}
