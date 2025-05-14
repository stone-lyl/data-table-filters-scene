export interface SalesRecord {
  transactionId: string;
  date: string;
  productName: string;
  productCategory: string;
  storeLocation: string;
  storeRegion: string;
  customerId: string;
  paymentMethod: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discountPercentage: number;
}

export interface GenerateOptions {
  from?: Date|string;
  to?: Date|string;
  count: number;
}