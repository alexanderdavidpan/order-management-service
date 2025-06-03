export interface CustomerDetails {
  id: string;
  email: string;
  name: string;
  defaultShippingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface ProductDetails {
  id: string;
  name: string;
  price: number;
  currency: string;
  stockLevel: number;
}

export interface ICustomerService {
  getCustomerById(customerId: string): Promise<CustomerDetails>;
}

export interface IInventoryService {
  getProductById(productId: string): Promise<ProductDetails>;
  checkProductAvailability(
    productId: string,
    quantity: number,
  ): Promise<boolean>;
  reserveProducts(productId: string, quantity: number): Promise<boolean>;
}
