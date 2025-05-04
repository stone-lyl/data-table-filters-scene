import { faker } from '@faker-js/faker';

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

const productCategories = [
  'Electronics',
  'Clothing',
  'Food',
  'Books',
  'Home & Garden',
];
const storeRegions = ['North', 'South', 'East', 'West', 'Central'];
const paymentMethods = ['Credit Card', 'Cash', 'Debit Card', 'Digital Wallet'];

export interface GenerateOptions {
  from?: Date | string;
  to?: Date | string;
  count: number;
}

function generateSalesRecord(options: {
  from?: Date | string;
  to?: Date | string;
}): SalesRecord {
  const quantity = faker.number.int({ min: 1, max: 10 });
  const unitPrice = faker.number.float({
    min: 10,
    max: 1000,
    fractionDigits: 2,
  });
  const discountPercentage = faker.number.float({
    min: 0,
    max: 30,
    fractionDigits: 2,
  });
  const totalAmount = quantity * unitPrice * (1 - discountPercentage / 100);

  return {
    transactionId: faker.string.uuid(),
    date: faker.date
      .between({
        from: options.from ?? '2024-01-01',
        to: options.to ?? '2025-04-30',
      })
      .toISOString(),
    productName: faker.commerce.productName(),
    productCategory: faker.helpers.arrayElement(productCategories),
    storeLocation: faker.location.city(),
    storeRegion: faker.helpers.arrayElement(storeRegions),
    customerId: faker.string.uuid(),
    paymentMethod: faker.helpers.arrayElement(paymentMethods),
    quantity,
    unitPrice,
    totalAmount,
    discountPercentage,
  };
}

export function generateSalesDataset(
  options: GenerateOptions | number
): SalesRecord[] {
  const opts = typeof options === 'number' ? { count: options } : options;
  return Array.from({ length: opts.count }, () =>
    generateSalesRecord({ from: opts.from, to: opts.to })
  );
}
