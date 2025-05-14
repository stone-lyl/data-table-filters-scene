import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableRender } from './virtualized-table';
import '@testing-library/jest-dom';
import * as React from 'react';
import * as DataTableProvider from '@/components/data-table/data-table-provider';
import { HeaderRowEventHandlersFn, RowEventHandlersFn } from '@/app/analyze-doc/types/event-handlers';
import { VirtualizedTableHeader } from './virtualized-table-header';
import { VirtualizedTableBody } from './virtualized-table-body';
import { ColumnDef } from '@tanstack/react-table';

// Mock the virtualized table components
vi.mock('./virtualized-table-header', () => ({
  VirtualizedTableHeader: vi.fn(() => <div data-testid="virtualized-table-header"></div>),
}));

vi.mock('./virtualized-table-body', () => ({
  VirtualizedTableBody: vi.fn(() => <div data-testid="virtualized-table-body"></div>),
}));

// Mock the imported components so we can access them in tests
vi.mocked(VirtualizedTableHeader);
vi.mocked(VirtualizedTableBody);

vi.mock('./virtualized-table-footer', () => ({
  DataTableFooter: vi.fn(() => <div data-testid="data-table-footer"></div>),
}));

// Mock the useDataTable hook
vi.mock('@/components/data-table/data-table-provider', () => ({
  useDataTable: vi.fn(() => ({
    table: {
      getAllColumns: () => [
        { id: 'col1' },
        { id: 'col2' }
      ],
      getHeaderGroups: () => [
        {
          id: 'headerGroup1',
          headers: [
            {
              id: 'header1',
              column: {
                columnDef: {
                  header: 'Header 1'
                }
              },
              isPlaceholder: false,
              getContext: () => ({}),
            },
            {
              id: 'header2',
              column: {
                columnDef: {
                  header: 'Header 2'
                }
              },
              isPlaceholder: false,
              getContext: () => ({}),
            }
          ]
        }
      ],
      getVisibleLeafColumns: () => [
        { 
          id: 'col1', 
          getSize: () => 150,
          columnDef: {},
          columns: [],
          depth: 0,
          getFlatColumns: () => [],
          getLeafColumns: () => [] 
        },
        { 
          id: 'col2', 
          getSize: () => 150,
          columnDef: {},
          columns: [],
          depth: 0,
          getFlatColumns: () => [],
          getLeafColumns: () => [] 
        }
      ],
      getRowModel: () => ({
        rows: [
          {
            id: 'row1',
            getIsSelected: () => false,
            getVisibleCells: () => [
              {
                id: 'cell1',
                column: {
                  id: 'col1',
                  columnDef: {
                    cell: 'Cell 1 Content'
                  }
                },
                getIsGrouped: () => false,
                getIsAggregated: () => false,
                getIsPlaceholder: () => false,
                getContext: () => ({}),
              },
              {
                id: 'cell2',
                column: {
                  id: 'col2',
                  columnDef: {
                    cell: 'Cell 2 Content'
                  }
                },
                getIsGrouped: () => false,
                getIsAggregated: () => false,
                getIsPlaceholder: () => false,
                getContext: () => ({}),
              }
            ],
            index: 0
          }
        ]
      })
    }
  }))
}));

vi.mock('@tanstack/react-table', () => ({
  flexRender: vi.fn((content) => content)
}));

describe('VirtualizedTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with headers and rows', () => {
    render(<TableRender />);

    // Check if the main table is rendered
    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();

    // Check if the virtualized components are rendered
    expect(screen.getByTestId('virtualized-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('virtualized-table-body')).toBeInTheDocument();

    // Check if the footer is rendered
    expect(screen.getByTestId('data-table-footer')).toBeInTheDocument();
  });

  it('renders with row event handlers', () => {
    const mockRowHandler = vi.fn(() => ({ 'data-custom': 'test' })) as unknown as RowEventHandlersFn<unknown>;

    render(<TableRender onRow={mockRowHandler} />);

    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();
    
    // The VirtualizedTableBody component should have been called with the onRow prop
    expect(vi.mocked(VirtualizedTableBody).mock.calls[0][0].onRow).toBe(mockRowHandler);
  });

  it('renders with header row event handlers', () => {
    const mockHeaderRowHandler = vi.fn(() => ({ 'data-custom': 'test' })) as unknown as HeaderRowEventHandlersFn<unknown>;

    render(<TableRender onHeaderRow={mockHeaderRowHandler} />);

    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();
    
    // The VirtualizedTableHeader component should have been called with the onHeaderRow prop
    expect(vi.mocked(VirtualizedTableHeader).mock.calls[0][0].onHeaderRow).toBe(mockHeaderRowHandler);
  });

  it('renders empty table when no rows', () => {
    vi.mocked(DataTableProvider.useDataTable).mockReturnValue({
      table: {
        getVisibleLeafColumns: () => [
          { 
            id: 'col1', 
            getSize: () => 150,
            // @ts-ignore
            columnDef: {},
            columns: [],
            depth: 0,
            getFlatColumns: () => [],
            getLeafColumns: () => [] 
          },
          { 
            id: 'col2', 
            getSize: () => 150,
            // @ts-ignore
            columnDef: {},
            columns: [],
            depth: 0,
            getFlatColumns: () => [],
            getLeafColumns: () => [] 
          }
        ],
        getHeaderGroups: () => [],
        getRowModel: () => ({ 
          rows: [],
          flatRows: [],
          rowsById: {}
        })
      }
    });

    render(<TableRender />);

    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();
    // Check if the virtualized components are rendered
    expect(screen.getByTestId('virtualized-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('virtualized-table-body')).toBeInTheDocument();
  });
});
