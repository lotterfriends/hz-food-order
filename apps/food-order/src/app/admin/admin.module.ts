import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UiModule } from '@hz/ui';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TimeagoModule } from 'ngx-timeago';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { OrderMessageDialogComponent } from './orders/order-message-dialog/order-message-dialog';
import { OrdersComponent } from './orders/orders.component';
import { ProductsComponent } from './products/products.component';
import { SettingsComponent } from './settings/settings.component';
import { TablePrintComponent } from './tables/table-print/table-print.component';
import { TablesComponent } from './tables/tables.component';
import { UserComponent } from './user/user.component';
@NgModule({
  declarations: [
    OrdersComponent,
    TablesComponent,
    AdminComponent,
    TablePrintComponent,
    ProductsComponent,
    AppHeaderComponent,
    AppNavigationComponent,
    OrderMessageDialogComponent,
    SettingsComponent,
    UserComponent
  ],
  imports: [
    NgxPermissionsModule.forChild(),
    ReactiveFormsModule,
    FormsModule,
    AdminRoutingModule,
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
    MatListModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatTabsModule,
    TimeagoModule
  ],
  bootstrap: [AdminComponent]
})
export class AdminModule { }
