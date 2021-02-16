import { Component, OnInit } from '@angular/core';
import { first, subscribeOn } from 'rxjs/operators';
import { AdminMealsService, Meal } from '../services/admin-meals.service';

interface ViewMeal extends Meal {
  edit: boolean;
}

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss']
})
export class MealsComponent implements OnInit {
  
  meals: ViewMeal[] = [];
  editMeals: ViewMeal[] = [];
  mealName: string = '';
  mealDesciption: string = '';
  mealStock: number = 0;


  constructor(
    private adminMealsService: AdminMealsService
  ) { }

  addMeal() {
    this.adminMealsService.createMeal({
      name: this.mealName,
      stock: this.mealStock,
      description: this.mealDesciption
    } as Meal).pipe(first()).subscribe((meal: Meal) => {
      this.meals.push({ edit: false, ...meal});
      this.mealName = '';
      this.mealDesciption = '';
      this.mealStock = 0;
    })
  }

  startEdit(meal: ViewMeal) {
    this.editMeals.push({ ...meal});
    meal.edit = true;
  }
  
  saveEdit(meal: ViewMeal) {
    this.adminMealsService.updateMeal(meal.id, {
      name: meal.name,
      stock: meal.stock,
      description: meal.description
    } as Meal).pipe(first()).subscribe(result => {
      const mealIndex = this.meals.findIndex(e => e.id === result.id);
      this.meals[mealIndex] = { edit: false, ...result};
    })
  }

  cancelEdit(meal: ViewMeal) {
    const editMealIndex = this.editMeals.findIndex(e => e.id === meal.id);
    if (editMealIndex > -1) {
      const mealIndex = this.meals.findIndex(e => e.id === this.editMeals[editMealIndex].id);
      this.meals[mealIndex] = this.editMeals[editMealIndex];
      this.editMeals.splice(editMealIndex, 1);
    }
  }

  clearForm(form: any) {
    form.reset();
  }

  ngOnInit(): void {
    this.adminMealsService.getMeals().pipe(first()).subscribe(result => {
      this.meals = result.map((e) => {
        return {
          edit: false,
          ...e
        }
      });
    });
  }

}
