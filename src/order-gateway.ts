
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody
} from '@nestjs/websockets';
import { throws } from 'assert';
import { Socket } from 'socket.io';
import { Order } from './order/order.entity';
import { Table } from './tables/table.entity';
import { TableService } from './tables/table.service';

interface ClientConnection {
  socket: Socket;
  table?: Table;
  tables?: Table[];
}

@WebSocketGateway()
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly tableService: TableService) {}
  
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
    console.log(data);
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

  sendOrderUpdateToTable(order: Order) {
    for (const currentConnection of this.connections) {
      if (currentConnection.table && currentConnection.table.id === order.table.id) {
        currentConnection.socket.emit('table-order-update', order);
      }
    }
  }

}
