export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export interface ShippingInfo {
  trackingCompany: string;
  trackingNumber: string;
  estimatedDeliveryDate?: Date;
  shippingAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingInfo?: ShippingInfo;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
