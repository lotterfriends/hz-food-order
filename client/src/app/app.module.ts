import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { AdminModule } from './admin/admin.module';
import { appInitializer } from './app-init';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './auth.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EmptyComponent } from './empty/empty.component';
import { LoginComponent } from './login/login.component';
import { UiModule } from './ui/ui.module';
import { OrderComponent } from './order/order.component';
import { SecretInterceptor } from './secret.interceptor';
import { TokenInterceptor } from './token.interceptor';
import { PrintTableComponent } from './print-table/print-table.component';
import { OrderRedirectComponent } from './order-redirect/order-redirect.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
registerLocaleData(localeDe, 'de');

export function tokenGetter(): string | null {
  return localStorage.getItem('token');
}

const socketConfig: SocketIoConfig = {
  url: environment.wsPath,
  options: {}
};


@NgModule({
  declarations: [
    AppComponent,
    OrderComponent,
    ConfirmDialogComponent,
    EmptyComponent,
    LoginComponent,
    PrintTableComponent,
    OrderRedirectComponent,
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    UiModule,
    NgxQRCodeModule,
    AdminModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: [environment.apiPath],
        disallowedRoutes: [],
      },
    }),
    SocketIoModule.forRoot(socketConfig)
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthService] },
    {provide: HTTP_INTERCEPTORS, useClass: SecretInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    {provide: LOCALE_ID, useValue: 'de' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
