import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Table } from 'typeorm';
import { ProductCategory } from './products-category.entity';
import { Product } from './products.entity';
import { ProductsService } from './products.service';

export interface ProductDto {
  name: string;
  stock: number;
  price: number;
  description?: string;
  categorie?: ProductCategory
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}


  @Post()
  create(@Body() createProductDto: ProductDto) {
    return this.productService.save(createProductDto);
  }
  
  @Put(':id')
  async update(@Param('id') id: number, @Body() product: Product) {
    await this.productService.update(id, product);
    return this.productService.findOneWithId(id);
  }

  @Get()
  getAll() {
    return this.productService.getAll();
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productService.delete(id);
  }

  @Post('order')
  order(@Body() data: {id: number, order: number}[]) {
    return this.productService.updateProductOrder(data);
  }


}
