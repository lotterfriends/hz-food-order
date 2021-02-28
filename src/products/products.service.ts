import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { CatergoryDto } from './product-categories.controller';
import { ProductCategory } from './products-category.entity';
import { ProductDto } from './products.controller';
import { Product } from './products.entity';
@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory) private categoryRepository: Repository<ProductCategory>,
  ) {}
    
  saveCategory(categoryDto: CatergoryDto) {
    return this.categoryRepository.save(categoryDto);
  }

  getAllCategories() {
    return this.categoryRepository.find();
  }

  deleteCategory(id: number) {
    return this.categoryRepository.delete(id);
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

  save(table: ProductDto): Promise<Product> {
    return this.productsRepository.save(table);
  }

  getAll() {
    return this.productsRepository.find();
  }

  findOneWithId(id: number) {
    return this.productsRepository.findOne(id);
  }

  update(id: number, product: Product) {
    return this.productsRepository.update(id, product);
  }

  async decreaseStock(productId: number, count: number) {
    const product = await this.findOneWithId(productId);
    product.stock = product.stock - count;
    return this.productsRepository.update(productId, {stock: product.stock});
  }

  delete(id: number) {
    this.productsRepository.softDelete(id);
  }


}
