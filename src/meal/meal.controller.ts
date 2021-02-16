import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Table } from 'typeorm';
import { Meal } from './meal.entity';
import { MealService } from './meal.service';

export interface MealDto {
  name: string;
  stock: number;
  description?: string;
}

@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealController {
  constructor(private readonly mealService: MealService) {}


  @Post()
  create(@Body() createMealDto: MealDto) {
    return this.mealService.save(createMealDto);
  }
  
  @Put(':id')
  async update(@Param('id') id: number, @Body() meal: Meal) {
    await this.mealService.update(id, meal);
    return this.mealService.findOneWithId(id);
  }

  @Get()
  getAll() {
    return this.mealService.getAll();
  }
}
