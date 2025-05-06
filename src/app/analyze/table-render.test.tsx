import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableRender } from './table-render';
import '@testing-library/jest-dom';
import * as React from 'react';
import { HeaderRowEventHandlersFn, RowEventHandlersFn } from './types/event-handlers';
import * as DataTableProvider from '@/components/data-table/data-table-provider';

// Mock the DataTableFooter component
vi.mock('./data-table-footer', () => ({
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

describe('TableRender', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with headers and rows', () => {
    render(<TableRender />);

    // Check if the main table is rendered
    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();

    // Check if the header is rendered
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(screen.getByTestId('header-row-headerGroup1')).toBeInTheDocument();
    expect(screen.getByTestId('header-cell-header1')).toBeInTheDocument();
    expect(screen.getByTestId('header-cell-header2')).toBeInTheDocument();

    // Check if the body is rendered
    expect(screen.getByTestId('table-body')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-row1')).toBeInTheDocument();
    expect(screen.getByTestId('table-cell-cell1')).toBeInTheDocument();
    expect(screen.getByTestId('table-cell-cell2')).toBeInTheDocument();

    // Check if the footer is rendered
    expect(screen.getByTestId('data-table-footer')).toBeInTheDocument();
  });

  it('renders with row event handlers', () => {
    const mockRowHandler = vi.fn(() => ({ 'data-custom': 'test' })) as unknown as RowEventHandlersFn<unknown>;

    render(<TableRender onRow={mockRowHandler} />);

    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();
    expect(mockRowHandler).toHaveBeenCalled();
  });

  it('renders with header row event handlers', () => {
    const mockHeaderRowHandler = vi.fn(() => ({ 'data-custom': 'test' })) as unknown as HeaderRowEventHandlersFn<unknown>;

    render(<TableRender onHeaderRow={mockHeaderRowHandler} />);

    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();
    expect(mockHeaderRowHandler).toHaveBeenCalled();
  });

  it('renders empty table when no rows', () => {
    vi.mocked(DataTableProvider.useDataTable).mockReturnValue({
      table: {
        // @ts-ignore
        getAllColumns: () => [{ id: 'col1' }, { id: 'col2' }],
        getHeaderGroups: () => [],
        // @ts-ignore
        getRowModel: () => ({ rows: [] })
      }
    });

    render(<TableRender />);

    expect(screen.getByTestId('analytics-table-main')).toBeInTheDocument();
    // Check if the row is empty
    expect(screen.getByTestId('table-body')).toBeInTheDocument();
    expect(screen.getByTestId('empty-row')).toBeInTheDocument();
  });
});
