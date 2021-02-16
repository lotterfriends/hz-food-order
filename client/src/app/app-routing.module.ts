import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { TablesComponent } from './admin/tables/tables.component';
import { AuthGuardService } from './auth-guard.service';
import { EmptyComponent } from './empty/empty.component';
import { LoginComponent } from './login/login.component';
import { OrderComponent } from './order/order.component';
import { adminRoutes} from './admin/admin-routing.module';
import { PrintTableComponent } from './print-table/print-table.component';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'order/:secret', 
    component: OrderComponent,
  },
  { 
    path: 'admin',
    component: AdminComponent,
    children: adminRoutes,
    canActivate: [AuthGuardService] ,
  },
  { 
    path: 'print-table',
    component: PrintTableComponent,
    canActivate: [AuthGuardService] ,
  },
  { path: '**', component: EmptyComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
