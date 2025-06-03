import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { MockCustomerService } from './services/external/mock-customer.service';
import { MockInventoryService } from './services/external/mock-inventory.service';

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [OrderService, MockCustomerService, MockInventoryService],
})
export class AppModule {}
