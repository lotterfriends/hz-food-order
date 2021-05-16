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
  logo?: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {

  private settings$ = new BehaviorSubject<Settings>(null);

  constructor(
    private http: HttpClient
  ) { }

  setSettings(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Settings>(`${environment.apiPath}/settings/client`).toPromise().then(settings => {
        this.settings$.next(settings);
        resolve();
      }, reject);
    });
  }

  getSettings(): Observable<Settings | null> {
    return this.settings$.asObservable();
  }

  getFilepath(filename: string): string {
    return `${environment.apiPath}/file/${filename}`;
  }


}
