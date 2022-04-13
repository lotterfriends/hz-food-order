import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable()
export class SecretInterceptor implements HttpInterceptor {
  private checkUrl(url: string): boolean {
    return url.startsWith(`${environment.apiPath}/table-orders`);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = req.url.toLowerCase();
    if (!this.checkUrl(url)) {
      return next.handle(req);
    }

    // Clone the request to add the new header
    const headers = req.headers
      .set('X-secret', sessionStorage.getItem('secret') ? '' + sessionStorage.getItem('secret') : '');
    const clonedRequest = req.clone({ headers });

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest);
  }

}
