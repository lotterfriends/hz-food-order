import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class PublicTableService {

  public static readonly URL_PREFIX = `${location.origin}/order/`;

  constructor(
    private http: HttpClient
  ) { }

  getSecretForCode(code: string): Observable<{hash: string}> {
    return this.http.get<{hash: string}>(`${environment.apiPath}/tables/code/${code}`);
  }


}
