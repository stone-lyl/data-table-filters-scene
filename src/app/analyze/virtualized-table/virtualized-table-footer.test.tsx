import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTableFooter } from './virtualized-table-footer';
import '@testing-library/jest-dom';
import * as React from 'react';
import { AggregationType } from '@/components/data-table/data-table-aggregations';

// Sample test data
const testData = [
  { id: 1, name: 'Item 1', amount: 100 },
  { id: 2, name: 'Item 2', amount: 200 },
  { id: 3, name: 'Item 3', amount: 300 },
];

// Create mock implementation for useDataTable
const mockUseDataTable = vi.fn();

// Mock the useDataTable hook
vi.mock('@/components/data-table/data-table-provider', () => ({
  useDataTable: () => mockUseDataTable()
}));

// Create mock implementations for the aggregation methods
const mockSumAggregation = vi.fn((columnId, values) => {
  if (columnId === 'amount') {
    return 600; // Hardcoded sum value for testing
  }
  return null;
});

const mockCountAggregation = vi.fn(() => 3); // Hardcoded count value for testing

// Setup mock data for the tests
const mockFooterAggregations = [
  { 
    type: 'sum' as AggregationType, 
    label: 'Sum', 
    aggregationMethod: mockSumAggregation
  },
  { 
    type: 'count' as AggregationType, 
    label: 'Count', 
    aggregationMethod: mockCountAggregation
  }
];

const mockTable = {
  getRowModel: () => ({
    rows: testData.map((item, index) => ({
      id: `row-${index}`,
      getValue: (key: string) => item[key as keyof typeof item],
      subRows: [],
    })),
  }),
  getCoreRowModel: () => ({
    flatRows: testData.map((item, index) => ({
      id: `row-${index}`,
      getValue: (key: string) => item[key as keyof typeof item],
      subRows: [],
    })),
  }),
  getPaginationRowModel: () => ({
    flatRows: testData.map((item, index) => ({
      id: `row-${index}`,
      getValue: (key: string) => item[key as keyof typeof item],
      subRows: [],
    })),
  }),
  getVisibleFlatColumns: () => [
    {
      id: 'id',
      columnDef: { meta: { fieldType: 'dimension' } }
    },
    {
      id: 'name',
      columnDef: { meta: { fieldType: 'dimension' } }
    },
    {
      id: 'amount',
      columnDef: { meta: { fieldType: 'measure' } }
    }
  ],
  getColumn: (columnId: string) => ({
    id: columnId,
    columnDef: {
      meta: { 
        fieldType: columnId === 'amount' ? 'measure' : 'dimension' 
      }
    }
  }),
};

describe('DataTableFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup the mock implementation for each test
    mockUseDataTable.mockReturnValue({
      footerAggregations: mockFooterAggregations,
      table: mockTable
    });
  });

  // todo: virtualColumns={[]} virtualPadding={{ left: 0, right: 0 }}
  it('renders the footer with sum and count aggregations', () => {
    render(<DataTableFooter data-testid="data-table-footer" virtualColumns={[]} virtualPadding={{ left: 0, right: 0 }} />);
    
    const footer = screen.getByTestId('table-footer');
    expect(footer).toBeInTheDocument();
    
    const sumRow = screen.getByTestId('footer-row-sum');
    const countRow = screen.getByTestId('footer-row-count');
    
    expect(sumRow).toBeInTheDocument();
    expect(countRow).toBeInTheDocument();
    
    const sumAmountCell = screen.getByTestId('footer-cell-sum-amount');
    const countAmountCell = screen.getByTestId('footer-cell-count-amount');
    
    expect(sumAmountCell).toBeInTheDocument();
    expect(countAmountCell).toBeInTheDocument();
  });

  it('renders the footer with no aggregations', () => {
    // Override the mock for this specific test
    mockUseDataTable.mockReturnValue({
      footerAggregations: [],
      table: {
        getRowModel: () => ({ rows: [] }),
        getCoreRowModel: () => ({ flatRows: [] }),
        getPaginationRowModel: () => ({ flatRows: [] }),
        getVisibleFlatColumns: () => [],
        getColumn: () => null,
      }
    });
    
    const { container } = render(<DataTableFooter data-testid="data-table-footer" virtualColumns={[]} virtualPadding={{ left: 0, right: 0 }} />);
    
    expect(screen.getByTestId('table-footer')).toBeInTheDocument();
    
    const footerRows = container.querySelectorAll('[data-testid^="footer-row-"]');
    expect(footerRows.length).toBe(0);
  });

  it('calculates aggregations correctly', () => {
    const { container } = render(<DataTableFooter data-testid="data-table-footer" virtualColumns={[]} virtualPadding={{ left: 0, right: 0 }} />);
    
    expect(mockSumAggregation).toHaveBeenCalled();
    expect(mockCountAggregation).toHaveBeenCalled();
    
    const footerRows = container.querySelectorAll('[data-testid^="footer-row-"]');
    expect(footerRows.length).toBe(2);
    
    const sumAmountCell = screen.getByTestId('footer-cell-sum-amount');
    const countAmountCell = screen.getByTestId('footer-cell-count-amount');
  
    const sumRow = screen.getByTestId('footer-row-sum');
    const countRow = screen.getByTestId('footer-row-count');

    expect(sumRow.textContent).toBe('Sum600');
    expect(countRow.textContent).toBe('Count333');
    expect(sumAmountCell.textContent).toBe('600');
    expect(countAmountCell.textContent).toBe('3');
  });
});
