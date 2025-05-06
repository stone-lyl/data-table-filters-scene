import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTableFooter } from './data-table-footer';
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

  it('renders the footer with sum and count aggregations', () => {
    render(<DataTableFooter data-testid="data-table-footer" />);
    
    // Check if the footer is rendered
    const footer = screen.getByTestId('table-footer');
    expect(footer).toBeInTheDocument();
    
    // Check if the footer rows for each aggregation type are rendered
    const sumRow = screen.getByTestId('footer-row-sum');
    const countRow = screen.getByTestId('footer-row-count');
    
    expect(sumRow).toBeInTheDocument();
    expect(countRow).toBeInTheDocument();
    
    const sumAmountCell = screen.getByTestId('footer-cell-sum-amount');
    const countAmountCell = screen.getByTestId('footer-cell-count-amount');
    
    expect(sumAmountCell).toBeInTheDocument();
    expect(countAmountCell).toBeInTheDocument();
    
    console.log('Sum amount cell:', sumAmountCell.textContent);
    console.log('Count amount cell:', countAmountCell.textContent);
    
    expect(sumRow.textContent?.length).toBeGreaterThan(0);
    expect(countRow.textContent?.length).toBeGreaterThan(0);
  });

  it('renders the footer with no aggregations', () => {
    // Override the mock for this specific test
    mockUseDataTable.mockReturnValue({
      footerAggregations: [],
      table: {
        getRowModel: () => ({ rows: [] }),
        getVisibleFlatColumns: () => [],
        getColumn: () => null,
      }
    });
    
    const { container } = render(<DataTableFooter data-testid="data-table-footer" />);
    
    // The test passes if the component renders without errors
    expect(screen.getByTestId('table-footer')).toBeInTheDocument();
    
    // There should be no footer rows
    const footerRows = container.querySelectorAll('[data-testid^="footer-row-"]');
    expect(footerRows.length).toBe(0);
  });

  it('calculates aggregations correctly', () => {
    const { container } = render(<DataTableFooter data-testid="data-table-footer" />);
    
    expect(mockSumAggregation).toHaveBeenCalled();
    expect(mockCountAggregation).toHaveBeenCalled();
    
    const footerRows = container.querySelectorAll('[data-testid^="footer-row-"]');
    expect(footerRows.length).toBe(2);
    
    const sumAmountCell = screen.getByTestId('footer-cell-sum-amount');
    const countAmountCell = screen.getByTestId('footer-cell-count-amount');

    expect(sumAmountCell).toBeInTheDocument();
    expect(countAmountCell).toBeInTheDocument();
  
    expect(sumAmountCell.textContent).toBe('600');
    expect(countAmountCell.textContent).toBe('3');
  });
});
