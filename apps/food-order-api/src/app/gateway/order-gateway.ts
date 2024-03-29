
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { Order } from '../order/order.entity';
import { Table } from '../tables/table.entity';
import { TableService } from '../tables/table.service';
import { Product } from '../products/products.entity';

@WebSocketGateway()
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly tableService: TableService,
    private readonly authService: AuthService
  ) { }

  @WebSocketServer() server: Server;


  async handleDisconnect(client: Socket): Promise<void> {
    // console.log('disconnect', client.id);
  }

  async handleConnection(client: Socket): Promise<void> {
    // console.log('connect', client.id);
  }

  @SubscribeMessage('table-register')
  async handleRegisterTable(client: Socket, secret: string) {
    const table = await this.tableService.getTableForSecret(secret);
    if (table) {
      client.join(secret);
    }
  }

  @SubscribeMessage('user-register')
  async handleRegisterUser(client: Socket, token: string) {
    if (!token) {
      return null;
    }
    const user = await this.authService.validateToken(token);
    if (user) {
      client.join('orders');
    }
  }

  sendOrderUpdateToUser(order: Order) {
    this.server.to('orders').emit('order-update', order);
  }

  async sendOrderUpdateToTable(order: Order, table: Table) {
    const { secret } = await this.tableService.addSecretToTable(table);
    this.server.to(secret).emit('table-order-update', order);
  }
  
  async sendProductUpdateToTable(product: Product) {
    this.server.emit('table-product-update', product);
  }

}
