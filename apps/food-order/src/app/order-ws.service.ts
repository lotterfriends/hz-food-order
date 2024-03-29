import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Product, ServerOrder } from './order/order.service';
@Injectable({
  providedIn: 'root'
})
export class OrderWSService {
    constructor(
      private socket: Socket,
      private authService: AuthService
    ) {

      this.socket.on('connect', () => {
        this.isConnected.next(true);
      });

      this.socket.on('disconnect', () => {
        this.isConnected.next(false);
      });

    }

    public isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


    registerAsTable(secret: string): void {
      this.socket.emit('table-register', secret);
    }

    registerAsUser(): void {
      const token = this.authService.getToken();
      this.socket.emit('user-register', token);
    }

    tableOrderUpdate(): Observable<ServerOrder>{
      return this.socket.fromEvent<ServerOrder>('table-order-update');
    }

    tableProductUpdate(): Observable<Product>{
      return this.socket.fromEvent<Product>('table-product-update');
    }

    orderUpdate(): Observable<ServerOrder>{
      return this.socket.fromEvent<ServerOrder>('order-update');
    }

    reconnect() {
      if (!this.isConnected.getValue()) {
        this.socket.connect();
      }
    }

}
