import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export class CrudService<T> {

  constructor(public _httpClient: HttpClient, public path: string) {}

  getAll(): Observable<T[]> {
    return this._httpClient.get<T[]>(`${environment.apiPath}/${this.path}`);
  }

  create(item: T): Observable<T> {
    return this._httpClient.post<T>(`${environment.apiPath}/${this.path}`, item);
  }

  update(id: string | number, item: T) {
    return this._httpClient.put<T>(`${environment.apiPath}/${this.path}/${id}`, item);
  }

  delete(id: string | number): Observable<T> {
    return this._httpClient.delete<T>(`${environment.apiPath}/${this.path}/${id}`);
  }
}
