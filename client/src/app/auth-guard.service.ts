import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    public jwtHelper: JwtHelperService
  ) {}

  canActivate(): boolean {
  
    
    const token = this.auth.getToken();
    
    if (typeof token !== 'string') {
      this.router.navigate(['login']);
      return false;
    }

    const eDate = this.jwtHelper.getTokenExpirationDate();
    if (eDate) {
      const eTime = eDate.getTime();
      const timeDiff = eTime - Date.now();
      if (timeDiff < 0) {
        this.router.navigate(['login']);
        return false;
      }
    }

    return true;
  }
}
