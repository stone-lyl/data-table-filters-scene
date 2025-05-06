import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsTableCore } from './analytics-table-core';
import { AggregationConfig, defaultAggregations } from '@/components/data-table/data-table-aggregations';
import { AccessorKeyColumnDef } from '@tanstack/react-table';
import * as React from 'react';

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
        data-testid="analytics-table-core"
        columns={testColumns}
        data={testData}
        footerAggregations={defaultAggregations as unknown as AggregationConfig<TestData>[]}
      />
    );

    expect(screen.getByTestId('table-render')).toBeInTheDocument();
    
    expect(screen.getByTestId('analytics-table-core-container')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-table-core-content')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-table-core-table-container')).toBeInTheDocument();
  });

  it('applies column visibility correctly', () => {
    const columnVisibility = { name: false, amount: true };
    const setColumnVisibility = vi.fn();

    render(
      <AnalyticsTableCore
        data-testid="analytics-table-core"
        columns={testColumns}
        data={testData}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    );

    expect(screen.getByTestId('table-render')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-table-core-container')).toBeInTheDocument();
  });
  
  it('renders with custom slots', () => {
    const customSidebar = <div data-testid="custom-sidebar">Custom Sidebar</div>;
    const customControls = <div data-testid="custom-controls">Custom Controls</div>;
    const customPagination = <div data-testid="custom-pagination">Custom Pagination</div>;
    
    render(
      <AnalyticsTableCore<TestData, unknown>
        data-testid="analytics-table-core"
        columns={testColumns}
        data={testData}
        sidebarSlot={customSidebar}
        controlsSlot={customControls}
        paginationSlot={customPagination}
      />
    );
    
    // Check if custom slots are rendered
    expect(screen.getByTestId('custom-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('custom-controls')).toBeInTheDocument();
    expect(screen.getByTestId('custom-pagination')).toBeInTheDocument();
  });
});