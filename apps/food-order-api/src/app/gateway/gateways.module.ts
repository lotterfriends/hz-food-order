import { Module } from '@nestjs/common';
import { TablesModule } from '../tables/table.module';
import { OrderGateway } from './order-gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TablesModule,
    AuthModule
  ],
  controllers: [],
  providers: [OrderGateway],
  exports: [OrderGateway]
})
export class GatewayModule {}
