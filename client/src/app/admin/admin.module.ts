import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { AdminComponent } from './admin.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { ProductsComponent } from './products/products.component';
import { TablesComponent } from './tables/tables.component';
import { UiModule } from '../ui/ui.module';
import { OrdersComponent } from './orders/orders.component';
import { AdminRoutingModule } from './admin-routing.module';
import { OrderMessageDialogComponent } from './orders/order-message-dialog/order-message-dialog';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    OrdersComponent,
    TablesComponent,
    AdminComponent,
    ProductsComponent,
    AppHeaderComponent,
    AppNavigationComponent,
    OrderMessageDialogComponent,
    SettingsComponent
  ],
  imports: [
    AdminRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    UiModule,
    NgxQRCodeModule
  ],
  bootstrap: [AdminComponent]
})
export class AdminModule { }
