import { Injectable } from '@nestjs/common';
import {
  ICustomerService,
  CustomerDetails,
} from '../../interfaces/external-services.interface';

@Injectable()
export class MockCustomerService implements ICustomerService {
  private readonly mockCustomers: Map<string, CustomerDetails> = new Map([
    [
      '1',
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        defaultShippingAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postalCode: '94105',
        },
      },
    ],
  ]);

  async getCustomerById(customerId: string): Promise<CustomerDetails> {
    const customer = this.mockCustomers.get(customerId);
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    return customer;
  }
}
