import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Settings {
  secret: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {

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
