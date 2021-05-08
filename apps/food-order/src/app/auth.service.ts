import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { first } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface User {
  id: number;
  username: string;
  password: string;
}

export interface AuthenticationPayload {
  user: User;
  payload: {
    type: string
    token: string
    refresh_token: string
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user: Observable<User | null> = this.userSubject.asObservable();
  private refreshTokenTimeout: number | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  // store the URL so we can redirect after logging in
  // redirectUrl: string;

  login(username: string, password: string): Promise<void> {
    return this.http.post<AuthenticationPayload>(`${environment.apiPath}/auth/login`, {
      username,
      password
    }).toPromise().then((result) => {
      if (result.payload.token) {
        this.userSubject.next(result.user);
        this.startRefreshTokenTimer();
        localStorage.setItem('token', result.payload.token);
        if (result.payload.refresh_token) {
          localStorage.setItem('refresh_token', result.payload.refresh_token);
        }
        this.router.navigate(['/admin']);
        this.refreshTokenWithTimer();
      }
    });
  }

  refresh(): Promise<void> {
    return this.http.post<AuthenticationPayload>(`${environment.apiPath}/auth/refresh`, {
      refresh_token:  localStorage.getItem('refresh_token'),
    }).toPromise().then((result) => {
      if (result.payload.token) {
        this.userSubject.next(result.user);
        localStorage.setItem('token', result.payload.token);
        if (result.payload.refresh_token) {
          localStorage.setItem('refresh_token', result.payload.refresh_token);
        }
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    this.http.post<{}>(`${environment.apiPath}/auth/logout`, {
      refresh_token:  localStorage.getItem('refresh_token')
    }).pipe(first()).subscribe(() => {
      this.removeToken();
      this.stopRefreshTokenTimer();
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    });
  }

  getMe(): Observable<{data: User}> {
    return this.http.get<{data: User}>(`${environment.apiPath}/profile`);
  }

  removeToken(): void {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
  }

  refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {

      let refreshTokenObject;
      try {
        refreshTokenObject = JSON.parse(atob(refreshToken.split('.')[1]));
      } catch (e) {
        this.removeToken();
      }
      if (refreshTokenObject) {
        const expires = new Date(refreshTokenObject.exp * 1000);

        if (expires.getTime() - Date.now() > 0) {
          return this.refresh().then(() => {}, () => {
            this.removeToken();
          });
        } else {
          this.removeToken();
        }
      }
    }
    return Promise.resolve();
  }

  refreshTokenWithTimer(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      let refreshTokenObject;
      try {
        refreshTokenObject = JSON.parse(atob(refreshToken.split('.')[1]));
      } catch (e) {
        this.removeToken();
      }
      if (refreshTokenObject) {
        const expires = new Date(refreshTokenObject.exp * 1000);
        if (expires.getTime() - Date.now() > 0) {
          return this.refresh().then(() => this.startRefreshTokenTimer(), () => {
            this.removeToken();
          });
        } else {
          this.removeToken();
        }
      }
    } else {
      this.startRefreshTokenTimer();
    }
    return Promise.resolve();
  }

  private startRefreshTokenTimer(): void {
    const token = localStorage.getItem('token');

    if (token) {
      // parse json object from base64 encoded jwt token
      const jwtToken = JSON.parse(atob(token.split('.')[1]));

      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000);
      this.refreshTokenTimeout = window.setTimeout(() => {
        this.refreshTokenWithTimer();
      }, timeout);
    }
  }

  private stopRefreshTokenTimer(): void {
    if (typeof this.refreshTokenTimeout !== 'undefined') {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

}
