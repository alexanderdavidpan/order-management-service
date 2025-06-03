import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateShippingInfoDto,
} from '../dtos/order.dto';
import { Order } from '../models/order.model';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<Order> {
    return this.orderService.getOrder(id);
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, updateStatusDto);
  }

  @Put(':id/shipping')
  async updateShippingInfo(
    @Param('id') id: string,
    @Body() updateShippingDto: UpdateShippingInfoDto,
  ): Promise<Order> {
    return this.orderService.updateShippingInfo(id, updateShippingDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteOrder(@Param('id') id: string): Promise<void> {
    await this.orderService.deleteOrder(id);
  }
}
