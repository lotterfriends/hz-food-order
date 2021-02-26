import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Table } from 'typeorm';
import { ProductCategory } from './products-category.entity';
import { Product } from './products.entity';
import { ProductsService } from './products.service';

export interface CatergoryDto {
  name: string;
  description?: string;
}

@Controller('product-categories')
@UseGuards(JwtAuthGuard)
export class ProductCategoriesController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  create(@Body() categoryDto: CatergoryDto) {
    return this.productService.saveCategory(categoryDto);
  }
  
  @Get()
  getAll() {
    return this.productService.getAllCategories();
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productService.deleteCategory(id);
  }

  @Post('order')
  order(@Body() data: {id: number, order: number}[]) {
    return this.productService.updateCategoriesOrder(data);
  }

}
