import type { FieldType } from '@/components/data-table/types';
import { faker } from '@faker-js/faker';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { formatCurrency } from '../analyze/util/formatters';
import { AmountComparisonCell } from './comparison-cell';

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

export const defaultColumnVisibility = {
  storeRegion: true,
  paymentMethod: true,
  current_date: true,
  totalAmount: true,
  totalQuantity: true,
  c_periodDate: true,
  c_totalAmount: true,
  c_totalQuantity: true,
  lastMonthQuantity: false,
  periodKey: false,
  amount_comparison: true,
};

export function generateSalesDataset(
  options: GenerateOptions | number
): SalesRecord[] {
  const opts = typeof options === 'number' ? { count: options } : options;
  return Array.from({ length: opts.count }, () =>
    generateSalesRecord({ from: opts.from, to: opts.to })
  );
}

export function generateColumns(data: unknown[]): ColumnDef<unknown, unknown>[] {
  if (data.length === 0) return [];

  const firstRow = data[0] as Record<string, unknown>;
  const columns : ColumnDef<unknown, unknown>[] = Object.keys(firstRow).map((key) => {
    // Determine the field type based on the key name
    const fieldType: FieldType = key.toLowerCase().includes('date') ||
      key.toLowerCase().includes('region') ||
      key.toLowerCase().includes('method') ?
      'dimension' : 'measure';

    // Create column definition in TanStack Table format
    const column: ColumnDef<unknown, unknown> = {
      id: key,
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      meta: {
        fieldType,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
      }
    };

    // Add special cell formatting for specific data types
    const value = firstRow[key];
    if (column.meta?.fieldType === 'measure' || value instanceof Number) {
      if (key.toLocaleLowerCase().includes('amount')) {
        return {
          ...column,
          cell: ({ getValue }) => {
            const value = getValue() as number;
            return `$${formatCurrency(value)}`;
          },
        };
      } else if (key.toLowerCase().includes('percentage') ||
        key.toLowerCase().includes('discount')) {
        return {
          ...column,
          cell: ({ getValue }) => {
            const value = getValue() as number;
            return `${value}%`;
          },
        };
      }
    }

    return {
      ...column,
      cell: ({ getValue }) => {
        const value = getValue();
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('current_date')) {
          return format(new Date(value as string), "yyyy/MM/dd");
        }
        return value?.toString() || '';
      },
    };
  });

  // Add a special comparison column for totalAmount and c_totalAmount
  if (firstRow.hasOwnProperty('totalAmount') && firstRow.hasOwnProperty('c_totalAmount')) {
    columns.push({
      id: 'amount_comparison',
      header: 'Amount Comparison',
      meta: {
        fieldType: 'measure',
        label: 'Amount Comparison'
      },
      cell: ({ row }) => {
        // Safely get values with fallbacks to prevent errors
        const currentAmount = row.getValue('totalAmount') as number || 0;
        const previousAmount = row.getValue('c_totalAmount') as number || 0;
        
        // Get date values if they exist
        let currentDate: string | undefined;
        let previousDate: string | undefined;
        
        try {
          if (row.getValue('current_date')) {
            currentDate = format(new Date(row.getValue('current_date') as string), "LLL dd, yyyy");
          }
          
          if (row.getValue('c_periodDate')) {
            previousDate = format(new Date(row.getValue('c_periodDate') as string), "LLL dd, yyyy");
          }
        } catch (error) {
          console.warn('Error formatting dates:', error);
        }
        
        return (
          <AmountComparisonCell
            currentAmount={currentAmount}
            previousAmount={previousAmount}
            currentDate={currentDate}
            previousDate={previousDate}
            showDate={true}
          />
        );
      }
    });
  }

  // the columns order as defaultColumnVisibility key order
  columns.sort((a, b) => {
    const aIndex = Object.keys(defaultColumnVisibility).indexOf(a.id as string);
    const bIndex = Object.keys(defaultColumnVisibility).indexOf(b.id as string);
    
    return aIndex - bIndex;
  });

  return columns;
}


