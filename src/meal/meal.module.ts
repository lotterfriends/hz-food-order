import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealController } from './meal.controller';
import { Meal } from './meal.entity';
import { MealService } from './meal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal])
  ],
  controllers: [MealController],
  providers: [MealService],
  exports: [MealService],
})
export class MealModule {}
