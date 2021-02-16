import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../auth-guard.service';
import { MealsComponent } from './meals/meals.component';
import { OrdersComponent } from './orders/orders.component';
import { SettingsComponent } from './settings/settings.component';
import { TablesComponent } from './tables/tables.component';

export const adminRoutes: Routes = [
  { 
    path: 'orders', 
    component: OrdersComponent,
    canActivate: [AuthGuardService],
    data: {
      title: 'Bestellungen',
      icon: 'all_inbox'
    }
  },
  { 
    path: 'tables', 
    component: TablesComponent,
    canActivate: [AuthGuardService],
    data: {
      title: 'Tische',
      icon: 'place'
    }
  },
  { 
    path: 'offers',
    component: MealsComponent,
    canActivate: [AuthGuardService],
    data: {
      title: 'Angebot',
      icon: 'local_offer'
    }
  },
  { 
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuardService],
    data: {
      title: 'Einstellungen',
      icon: 'settings'
    }
  },
  { path: '**', redirectTo: 'orders' }
];

@NgModule({
  imports: [RouterModule.forRoot(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
