import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { OrderGateway } from '../gateway/order-gateway';
import { SettingsService } from '../settings/settings.service';
import { CategoryDto } from './product-categories.controller';
import { ProductCategory } from './products-category.entity';
import { ProductDto } from './products.controller';
import { Product } from './products.entity';
@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory) private categoryRepository: Repository<ProductCategory>,
    private readonly orderGateway: OrderGateway,
    private readonly settingsService: SettingsService
  ) {}
    
  async saveCategory(categoryDto: CategoryDto) {
    const query = this.categoryRepository.createQueryBuilder('ProductCategory');
    query.select("MAX(ProductCategory.order)", "max");
    let { max } = await query.getRawOne();
    if (max) {
      categoryDto.order = ++max;
    }
    return this.categoryRepository.save(categoryDto);
  }

  async updateCategory(category: ProductCategory) {
    await this.categoryRepository.update(category.id, category);
    return this.categoryRepository.findOne(category.id);
  }

  getAllCategories() {
    return this.categoryRepository.find();
  }

  deleteCategory(id: number) {
    return this.categoryRepository.softDelete(id);
  }

  async updateCategoriesOrder(entries: {id: number, order: number}[]) {
    for (const entry of entries) {
      const c = await this.categoryRepository.findOne(entry.id);
      c.order = entry.order;
      await this.categoryRepository.save(c);
    }
  }

  async updateProductOrder(entries: { id: number; order: number; }[]) {
    for (const entry of entries) {
      const c = await this.productsRepository.findOne(entry.id);
      c.order = entry.order;
      await this.productsRepository.save(c);
    }
  }

  async save(table: ProductDto): Promise<Product> {
    const query = this.categoryRepository.createQueryBuilder('Product');
    query.select("MAX(Product.order)", "max");
    let { max } = await query.getRawOne();
    if (max) {
      table.order = ++max;
    }
    return this.productsRepository.save(table);
  }

  getAll() {
    return this.productsRepository.find();
  }

  getAllEnabled() {
    return this.productsRepository.createQueryBuilder('p')
      .innerJoinAndSelect('p.category', 'c')
      .where('p.disabled = false')
      .andWhere('c.disabled = false')
      .getMany();
  }

  findOneWithId(id: number) {
    return this.productsRepository.findOne(id, {
      relations: ['category']
    });
  }

  async update(id: number, product: Product) {
    await this.productsRepository.update(id, product);
    const changedProduct = await this.findOneWithId(id);
    this.orderGateway.sendProductUpdateToTable(changedProduct);
    return changedProduct;
  }

  async decreaseStock(productId: number, count: number) {
    const settings = await this.settingsService.getSettings();
    const product = await this.findOneWithId(productId);
    product.stock = product.stock - count;
    if (settings.disableProductOnOutOfStock && product.stock <= 0 && !product.disabled) {
      product.disabled = true;
      this.orderGateway.sendProductUpdateToTable(product);
    }
    return this.productsRepository.update(productId, {stock: product.stock, disabled: product.disabled});
  }
  
  async increaseStock(productId: number, count: number) {
    const settings = await this.settingsService.getSettings();
    const product = await this.findOneWithId(productId);
    product.stock = product.stock + count;
    if (settings.disableProductOnOutOfStock && product.stock > 0 && !product.disabled) {
      product.disabled = false;
      this.orderGateway.sendProductUpdateToTable(product);
    }
    return this.productsRepository.update(productId, {stock: product.stock, disabled: product.disabled});
  }

  delete(id: number) {
    this.productsRepository.softDelete(id);
  }

  async restoreProduct(id: number): Promise<Product> {
    await this.productsRepository.restore(id);
    return this.productsRepository.findOne(id);
  }

  async restoreCategory(id: number): Promise<ProductCategory> {
    await this.categoryRepository.restore(id);
    return this.categoryRepository.findOne(id);
  }


}
