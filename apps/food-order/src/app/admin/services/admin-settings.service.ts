import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Settings {
  secret?: string;
  seperateOrderPerProductCategory?: boolean;
  disableProductOnOutOfStock?: boolean;
  orderCode?: boolean;
  whileStocksLast?: boolean;
  pickupOrder?: boolean;
  updated?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {
  updateSettings(settings: Settings) {
    return this.http.put<Settings>(`${environment.apiPath}/settings`, settings);
  }

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(`${environment.apiPath}/settings`);
  }

  updateSecret(secret: string): Observable<Settings> {
    return this.http.put<Settings>(`${environment.apiPath}/settings/update-secret`, {secret});
  }

  getNewSecret(): Observable<{secret: string}> {
    return this.http.get<{secret: string}>(`${environment.apiPath}/settings/random`);
  }

}
