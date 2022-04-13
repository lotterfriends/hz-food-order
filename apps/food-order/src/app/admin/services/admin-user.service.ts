import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../../auth.service';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService extends CrudService<User> {

  constructor(protected http: HttpClient) {
    super(http, 'users');
  }

  createAdminUser(user: User): Observable<void> {
    return this.http.post<void>(`${environment.apiPath}/create-admin`, user);
  }

}
