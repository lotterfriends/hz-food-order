import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { MealDto } from './meal.controller';
import { Meal } from './meal.entity';
@Injectable()
export class MealService {

  constructor(
    @InjectRepository(Meal) private mealRepository: Repository<Meal>,
  ) {}

  save(table: MealDto): Promise<Meal> {
    return this.mealRepository.save(table);
  }

  getAll() {
    return this.mealRepository.find();
  }

  findOneWithId(id: number) {
    return this.mealRepository.findOne(id);
  }

  update(id: number, meal: Meal) {
    return this.mealRepository.update(id, meal);
  }

  async decreaseStock(mealId: number, count: number) {
    const meal = await this.findOneWithId(mealId);
    meal.stock = meal.stock - count;
    return this.mealRepository.update(mealId, {stock: meal.stock});
  }


}
