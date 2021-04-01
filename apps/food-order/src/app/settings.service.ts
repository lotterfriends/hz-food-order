import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface Settings {
  seperateOrderPerProductCategory: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  
  constructor(
    private http: HttpClient
  ) {}

  setSettings() {
    if (!sessionStorage.getItem('settings')) {
      this.http.get<Settings>(`${environment.apiPath}/settings/client`).toPromise().then(settings => {
        sessionStorage.setItem('settings', JSON.stringify(settings, null, 2));
      });
    }
  }

  getSettings(): Settings | null {
    const storageSettings = sessionStorage.getItem('settings');
    if (storageSettings) {
      return JSON.parse(storageSettings) as Settings;
    }
    return null;
  }


}
