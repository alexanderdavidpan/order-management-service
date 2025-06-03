import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from '../../src/services/order.service';
import { MockCustomerService } from '../../src/services/external/mock-customer.service';
import { MockInventoryService } from '../../src/services/external/mock-inventory.service';
import { OrderStatus } from '../../src/models/order.model';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from '../../src/dtos/order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let customerService: MockCustomerService;
  let inventoryService: MockInventoryService;

  const mockCustomer = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    defaultShippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'Test Country',
      postalCode: '12345',
    },
  };

  const mockProduct = {
    id: 'prod1',
    name: 'Test Product',
    price: 100,
    currency: 'USD',
    stockLevel: 10,
  };

  const mockCreateOrderDto: CreateOrderDto = {
    customerId: '1',
    items: [
      {
        productId: 'prod1',
        variantId: 'var1',
        quantity: 2,
      },
    ],
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'Test Country',
      postalCode: '12345',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        MockCustomerService,
        MockInventoryService,
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    customerService = module.get<MockCustomerService>(MockCustomerService);
    inventoryService = module.get<MockInventoryService>(MockInventoryService);

    // Setup spies
    jest.spyOn(customerService, 'getCustomerById').mockResolvedValue(mockCustomer);
    jest.spyOn(inventoryService, 'getProductById').mockResolvedValue(mockProduct);
    jest.spyOn(inventoryService, 'checkProductAvailability').mockResolvedValue(true);
    jest.spyOn(inventoryService, 'reserveProducts').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const result = await service.createOrder(mockCreateOrderDto);

      expect(result).toBeDefined();
      expect(result.customerId).toBe(mockCreateOrderDto.customerId);
      expect(result.items).toHaveLength(1);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.currency).toBe('USD');
      expect(result.total).toBe(220); // 200 (2 * 100) + 20 (10% tax)
      expect(result.shippingInfo).toBeDefined();
      expect(result.shippingInfo!.shippingAddress).toEqual(mockCreateOrderDto.shippingAddress);
    });

    it('should throw BadRequestException when product is not available', async () => {
      jest.spyOn(inventoryService, 'checkProductAvailability').mockResolvedValue(false);

      await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when items have different currencies', async () => {
      const differentCurrencyProduct = { ...mockProduct, currency: 'EUR' };
      jest.spyOn(inventoryService, 'getProductById')
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(differentCurrencyProduct);

      const orderWithMultipleCurrencies: CreateOrderDto = {
        ...mockCreateOrderDto,
        items: [
          { productId: 'prod1', variantId: 'var1', quantity: 1 },
          { productId: 'prod2', variantId: 'var2', quantity: 1 },
        ],
      };

      await expect(service.createOrder(orderWithMultipleCurrencies)).rejects.toThrow(
        'All items must be in the same currency'
      );
    });
  });

  describe('getOrder', () => {
    it('should return an order if it exists', async () => {
      const createdOrder = await service.createOrder(mockCreateOrderDto);
      const result = await service.getOrder(createdOrder.id);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(createdOrder.id);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      await expect(service.getOrder('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status for valid transitions', async () => {
      const createdOrder = await service.createOrder(mockCreateOrderDto);
      
      const updateDto: UpdateOrderStatusDto = {
        status: OrderStatus.PROCESSING,
      };

      const result = await service.updateOrderStatus(createdOrder.id, updateDto);
      
      expect(result.status).toBe(OrderStatus.PROCESSING);
    });

    it('should throw BadRequestException for invalid transitions', async () => {
      const createdOrder = await service.createOrder(mockCreateOrderDto);
      
      const updateDto: UpdateOrderStatusDto = {
        status: OrderStatus.DELIVERED,
      };

      await expect(service.updateOrderStatus(createdOrder.id, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateShippingInfo', () => {
    it('should update shipping info successfully', async () => {
      const createdOrder = await service.createOrder(mockCreateOrderDto);
      
      const updateDto: UpdateShippingInfoDto = {
        trackingCompany: 'Test Shipping Co',
        trackingNumber: 'TRACK123',
        estimatedDeliveryDate: new Date(),
      };

      const result = await service.updateShippingInfo(createdOrder.id, updateDto);
      
      expect(result.shippingInfo).toBeDefined();
      expect(result.shippingInfo!.trackingCompany).toBe(updateDto.trackingCompany);
      expect(result.shippingInfo!.trackingNumber).toBe(updateDto.trackingNumber);
      expect(result.shippingInfo!.estimatedDeliveryDate).toBeDefined();
    });

    it('should throw BadRequestException if shipping address is not set', async () => {
      const createdOrder = await service.createOrder(mockCreateOrderDto);
      
      // Create a new shipping info object without an address
      createdOrder.shippingInfo = {
        trackingCompany: '',
        trackingNumber: '',
        shippingAddress: null as any, // Force type assertion for testing
      };
      
      const updateDto: UpdateShippingInfoDto = {
        trackingCompany: 'Test Shipping Co',
        trackingNumber: 'TRACK123',
      };

      await expect(service.updateShippingInfo(createdOrder.id, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an existing order', async () => {
      const createdOrder = await service.createOrder(mockCreateOrderDto);
      await expect(service.deleteOrder(createdOrder.id)).resolves.not.toThrow();
      await expect(service.getOrder(createdOrder.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting non-existent order', async () => {
      await expect(service.deleteOrder('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 