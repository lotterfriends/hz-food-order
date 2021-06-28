import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AuthGuardService } from './auth-guard.service';
import { EmptyComponent } from './empty/empty.component';
import { LoginComponent } from './login/login.component';
import { OrderComponent } from './order/order.component';
import { adminRoutes} from './admin/admin-routing.module';
import { OrderGuard } from './order.guard';
import { OrderRedirectComponent } from './order-redirect/order-redirect.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'order/:secret',
    component: OrderRedirectComponent,
  },
  {
    path: 'order-table',
    component: OrderComponent,
    canActivate: [OrderGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: adminRoutes,
    canActivate: [AuthGuardService] ,
  },
  { path: '**', component: EmptyComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
