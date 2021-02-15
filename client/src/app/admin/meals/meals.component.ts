import { Component, OnInit } from '@angular/core';
import { AdminService, Meal, Table } from '../admin.service';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { FormGroup } from '@angular/forms';

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


  constructor(private adminService: AdminService) { }

  addMeal() {
    this.adminService.createMeal({
      name: this.mealName,
      stock: this.mealStock,
      description: this.mealDesciption
    } as Meal).subscribe((meal: Meal) => {
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
    this.adminService.updateMeal(meal.id, {
      name: meal.name,
      stock: meal.stock,
      description: meal.description
    } as Meal).subscribe(result => {
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
    this.adminService.getMeals().subscribe(result => {
      this.meals = result.map((e) => {
        return {
          edit: false,
          ...e
        }
      });
    });
  }

}
