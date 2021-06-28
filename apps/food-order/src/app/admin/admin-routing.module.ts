import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../auth-guard.service';
import { ProductsComponent } from './products/products.component';
import { OrdersComponent } from './orders/orders.component';
import { SettingsComponent } from './settings/settings.component';
import { TablesComponent } from './tables/tables.component';
import { TablePrintComponent } from './tables/table-print/table-print.component';

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
    },
    children: [
      {
        path: 'print',
        component: TablePrintComponent,
        data: {
          title: 'Tische drucken',
          icon: 'place'
        }
      }
    ]
  },
  {
    path: 'offers',
    component: ProductsComponent,
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
