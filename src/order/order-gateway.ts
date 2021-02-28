
import {
  MessageBody, OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { Order } from './order.entity';
import { Table } from '../tables/table.entity';
import { TableService } from '../tables/table.service';
import { User } from 'src/users/users.service';

interface ClientConnection {
  socket: Socket;
  table?: Table;
  user?: User;
  tables?: Table[];
}

@WebSocketGateway()
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly tableService: TableService,
    private readonly authService: AuthService
  ) {}
  
  @WebSocketServer() server;

  connections: ClientConnection[] = [];

  async handleDisconnect(client: Socket): Promise<void> {
    this.connections = this.connections.filter(e => e.socket.id === client.id)
  }
  
  async handleConnection(client: Socket): Promise<void> {
    const clientConnection = {
      socket: client,
    }
    this.connections = [...this.connections, clientConnection];
  }

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  @SubscribeMessage('table-register')
  async handleRegisterTable(client: Socket, secret: string) {
    const table = await this.tableService.getTableForSecret(secret);
    for (const currentConnection of this.connections) {
      if (currentConnection.socket.id === client.id) {
        currentConnection.table = table;
      }
    }
  }

  @SubscribeMessage('user-register')
  async handleRegisterUser(client: Socket, token: string) {
    const user = await this.authService.validateToken(token);
    if (user) {
      for (const currentConnection of this.connections) {
        if (currentConnection.socket.id === client.id) {
          currentConnection.user = user;
        }
      }
    }
  }

  sendOrderUpdateToUser(order: Order) {
    for (const currentConnection of this.connections) {
      if (currentConnection.user) {
        currentConnection.socket.emit('order-update', order);
      }
    }
  }

  sendOrderUpdateToTable(order: Order) {
    for (const currentConnection of this.connections) {
      if (currentConnection.table && currentConnection.table.id === order.table.id) {
        currentConnection.socket.emit('table-order-update', order);
      }
    }
  }

}
