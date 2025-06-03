import { Injectable } from '@nestjs/common';
import {
  IInventoryService,
  ProductDetails,
} from '../../interfaces/external-services.interface';

@Injectable()
export class MockInventoryService implements IInventoryService {
  private readonly mockProducts: Map<string, ProductDetails> = new Map([
    [
      'prod1',
      {
        id: 'prod1',
        name: 'Premium Widget',
        price: 99.99,
        currency: 'USD',
        stockLevel: 100,
      },
    ],
  ]);

  private readonly reservations: Map<string, number> = new Map();

  async getProductById(productId: string): Promise<ProductDetails> {
    const product = this.mockProducts.get(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    return product;
  }

  async checkProductAvailability(
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const product = await this.getProductById(productId);
    const reserved = this.reservations.get(productId) || 0;
    return product.stockLevel - reserved >= quantity;
  }

  async reserveProducts(productId: string, quantity: number): Promise<boolean> {
    if (!(await this.checkProductAvailability(productId, quantity))) {
      return false;
    }

    const currentReservation = this.reservations.get(productId) || 0;
    this.reservations.set(productId, currentReservation + quantity);
    return true;
  }
}
