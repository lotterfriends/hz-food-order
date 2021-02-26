import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { ProductDto } from './products.controller';
import { Product } from './products.entity';
@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

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
