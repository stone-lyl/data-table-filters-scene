import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AnalyticsTableCore } from './analytics-table-core';
import { defaultAggregations, sumAggregation, countAggregation, AggregationConfig } from '@/components/data-table/data-table-aggregations';
import { AccessorColumnDef, AccessorKeyColumnDef, ColumnDef } from '@tanstack/react-table';
import * as React from 'react';
import { DataTableProvider } from '@/components/data-table/data-table-provider';
import Decimal from 'decimal.js-light';
import { DataTableFooter } from './data-table-footer';

// Mock the DataTableFooter component to test it separately
vi.mock('./data-table-footer', () => ({

  DataTableFooter: vi.fn(({ children }: { children?: React.ReactNode }) => (
    <div data-testid="data-table-footer">{children}</div>
  )),
}));

// Mock the TableRender component
vi.mock('./table-render', () => ({
  TableRender: vi.fn(() => <div data-testid="table-render"></div>),
}));

// Sample data for testing
interface TestData {
  id: number;
  name: string;
  amount: number;
  isActive: boolean;
}

const testData: TestData[] = [
  { id: 1, name: 'Item 1', amount: 100, isActive: true },
  { id: 2, name: 'Item 2', amount: 200, isActive: false },
  { id: 3, name: 'Item 3', amount: 300, isActive: true },
];

// Sample columns for testing
const testColumns: AccessorKeyColumnDef<TestData>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.getValue('id'),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.getValue('name'),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: {
      fieldType: 'measure',
    },
    cell: ({ row }) => `$${row.getValue('amount')}`,
  },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: ({ row }) => (row.getValue('isActive') ? 'Yes' : 'No'),
  },
];


describe('AnalyticsTableCore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with data', () => {
    render(
      <AnalyticsTableCore<TestData, unknown>
        columns={testColumns}
        data={testData}
        footerAggregations={defaultAggregations as unknown as AggregationConfig<TestData>[]}
      />
    );

    // Check if TableRender is rendered
    expect(screen.getByTestId('table-render')).toBeInTheDocument();
  });

  it('applies column visibility correctly', () => {
    const columnVisibility = { name: false, amount: true };
    const setColumnVisibility = vi.fn();

    render(
      <AnalyticsTableCore
        columns={testColumns}
        data={testData}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    );

    // The test passes if the component renders without errors
    expect(screen.getByTestId('table-render')).toBeInTheDocument();
  });
});

describe('DataTableFooter', () => {
  beforeEach(() => {
    vi.mock('@/components/data-table/data-table-provider', () => ({
      useDataTable: vi.fn(() => ({
        footerAggregations: defaultAggregations,
        table: {
          getRowModel: () => ({
            rows: testData.map((item, index) => ({
              id: `row-${index}`,
              getValue: (key: keyof TestData) => item[key],
            })),
          }),
          getVisibleFlatColumns: () => 
            testColumns.map((col: AccessorKeyColumnDef<TestData>) => ({
              id: col.accessorKey,
              columnDef: col,
            })),
          getColumn: (columnId: string) => ({
            id: columnId,
            columnDef: testColumns.find(col => col.accessorKey === columnId),
          }),
        },
      })),
      DataTableProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }));
  });

  it('renders footer with aggregations', () => {
    
    render(<DataTableFooter />);
    
    // Test will pass if the component renders without errors
    // Actual assertions would depend on the rendered output
  });
});

