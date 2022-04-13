import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductCategory } from './products-category.entity';
import { Product } from './products.entity';
import { ProductsService } from './products.service';
import { OrderGateway } from '../gateway/order-gateway';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../users/roles.enum';
import { Roles } from '../auth/roles.decorator';

export interface ProductDto {
  name: string;
  stock: number;
  price: number;
  description?: string;
  categorie?: ProductCategory;
  order: number;
}

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly productService: ProductsService,
    private readonly orderGateway: OrderGateway
  ) {}


  @Post()
  create(@Body() createProductDto: ProductDto) {
    return this.productService.save(createProductDto);
  }
  
  @Put(':id')
  update(@Param('id') id: number, @Body() product: Product) {
    return this.productService.update(id, product);
  }

  @Get(':id/restore')
  restore(@Param('id') id: number) {
    return this.productService.restoreProduct(id);
  }

  @Get()
  getAll() {
    return this.productService.getAll();
  }

  @Delete(':id')
  @Roles(Role.Admin)
  delete(@Param('id') id: number) {
    return this.productService.delete(id);
  }

  @Post('order')
  order(@Body() data: {id: number, order: number}[]) {
    return this.productService.updateProductOrder(data);
  }


}
