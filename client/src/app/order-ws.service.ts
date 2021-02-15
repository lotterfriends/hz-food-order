import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerOrder } from './order/order.service';

@Injectable({
  providedIn: 'root'
})
export class OrderWSService {
    constructor(private socket: Socket) { 

      this.socket.on('connect', () => {
        this.isConnected.next(true);
      });
      
      this.socket.on('disconnect', () => {
        this.isConnected.next(false);
      });

    }

    public isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


    registerAsTable(secret: string) {
      console.log(this.socket);
      console.log(secret);
      this.socket.emit('table-register', secret);
    }

    sendMessage(msg: string){
      this.socket.emit('message', msg);
    }

    getMessage() {
      return this.socket.fromEvent('message').pipe(map((data) => (data as any).msg));
    }

    tableOrderUpdate(): Observable<ServerOrder>{
      return this.socket.fromEvent<ServerOrder>('table-order-update');
    }

    
}