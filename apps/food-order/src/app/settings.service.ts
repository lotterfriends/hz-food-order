import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Settings {
  seperateOrderPerProductCategory: boolean;
  disableProductOnOutOfStock: boolean;
  orderCode: boolean;
  whileStocksLast: boolean;
  pickupOrder: boolean;
  orderSound: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  
  private settings$ = new BehaviorSubject<Settings>(null);

  constructor(
    private http: HttpClient
  ) {}

  setSettings() {
    this.http.get<Settings>(`${environment.apiPath}/settings/client`).toPromise().then(settings => {
      this.settings$.next(settings);
    });
  }

  getSettings(): Observable<Settings | null> {
    return this.settings$.asObservable();
  }


}
