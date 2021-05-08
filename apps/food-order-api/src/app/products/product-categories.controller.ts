import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductCategory } from './products-category.entity';
import { ProductsService } from './products.service';

export interface CategoryDto {
  name: string;
  description?: string;
  order?: number;
}

@Controller('product-categories')
@UseGuards(JwtAuthGuard)
export class ProductCategoriesController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  create(@Body() categoryDto: CategoryDto) {
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

  @Put()
  async update(@Body() category: ProductCategory) {
    return this.productService.updateCategory(category);
  }

  @Post('order')
  order(@Body() data: {id: number, order: number}[]) {
    return this.productService.updateCategoriesOrder(data);
  }

  

}
