import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Order, OrderStatus } from '../models/order.model';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from '../dtos/order.dto';
import { MockCustomerService } from './external/mock-customer.service';
import { MockInventoryService } from './external/mock-inventory.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  private orders: Map<string, Order> = new Map();

  constructor(
    private readonly customerService: MockCustomerService,
    private readonly inventoryService: MockInventoryService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate customer exists
    const customer = await this.customerService.getCustomerById(createOrderDto.customerId);

    // Validate and reserve products
    const orderItems = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const product = await this.inventoryService.getProductById(item.productId);
        const isAvailable = await this.inventoryService.checkProductAvailability(
          item.productId,
          item.quantity,
        );

        if (!isAvailable) {
          throw new BadRequestException(`Product ${item.productId} is not available in requested quantity`);
        }

        await this.inventoryService.reserveProducts(item.productId, item.quantity);

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: product.price,
          currency: product.currency,
        };
      }),
    );

    // Validate currency consistency
    const currencies = new Set(orderItems.map(item => item.currency));
    if (currencies.size > 1) {
      throw new BadRequestException('All items must be in the same currency');
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax rate for example
    const total = subtotal + tax;

    const order: Order = {
      id: uuidv4(),
      customerId: customer.id,
      items: orderItems,
      status: OrderStatus.PENDING,
      shippingInfo: {
        trackingCompany: '',
        trackingNumber: '',
        shippingAddress: createOrderDto.shippingAddress,
      },
      subtotal,
      tax,
      total,
      currency: orderItems[0].currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(order.id, order);
    return order;
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }
    return order;
  }

  async updateOrderStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.getOrder(orderId);
    
    // Validate status transition
    if (!this.isValidStatusTransition(order.status, updateStatusDto.status)) {
      throw new BadRequestException(`Invalid status transition from ${order.status} to ${updateStatusDto.status}`);
    }
    
    order.status = updateStatusDto.status;
    order.updatedAt = new Date();
    this.orders.set(orderId, order);
    return order;
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // No further transitions allowed
      [OrderStatus.CANCELED]: [], // No further transitions allowed
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  async updateShippingInfo(orderId: string, updateShippingDto: UpdateShippingInfoDto): Promise<Order> {
    const order = await this.getOrder(orderId);
    
    if (!order.shippingInfo?.shippingAddress) {
      throw new BadRequestException('Cannot update shipping info without a shipping address. Please set shipping address first.');
    }

    order.shippingInfo = {
      shippingAddress: order.shippingInfo.shippingAddress,
      trackingCompany: updateShippingDto.trackingCompany,
      trackingNumber: updateShippingDto.trackingNumber,
      estimatedDeliveryDate: updateShippingDto.estimatedDeliveryDate,
    };

    order.updatedAt = new Date();
    this.orders.set(orderId, order);
    return order;
  }

  async deleteOrder(orderId: string): Promise<void> {
    const exists = this.orders.has(orderId);
    if (!exists) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }
    this.orders.delete(orderId);
  }
} 