import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { AdminComponent } from './admin.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { ProductsComponent } from './products/products.component';
import { TablesComponent } from './tables/tables.component';
import { UiModule } from '@hz/ui';
import { OrdersComponent } from './orders/orders.component';
import { AdminRoutingModule } from './admin-routing.module';
import { OrderMessageDialogComponent } from './orders/order-message-dialog/order-message-dialog';
import { SettingsComponent } from './settings/settings.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
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
    ReactiveFormsModule,
    AdminRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxQRCodeModule,
    CurrencyMaskModule,
    UiModule,
    MatToolbarModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    DragDropModule,
    MatTableModule,
    MatDividerModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule
  ],
  bootstrap: [AdminComponent]
})
export class AdminModule { }
