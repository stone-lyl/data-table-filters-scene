import { render, screen } from '@testing-library/react';
import { AnalyticsTable } from './analytics-table';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import * as React from 'react';
import { ColumnSchema } from './types/types';
import { REGIONS } from '@/constants/region';
import { TAGS } from '@/constants/tag';
import { data } from './const/data';

vi.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: vi.fn(() => [{}, vi.fn()]),
}));

vi.mock('nuqs', () => ({
  useQueryStates: vi.fn(() => [{}, vi.fn()]),
}));

vi.mock('./hooks/use-row-edit', () => ({
  useRowEdit: vi.fn(() => ({
    rowEventHandlers: {},
  })),
}));

vi.mock('./hooks/use-header-toast', () => ({
  useHeaderToast: vi.fn(() => ({
    headerRowEventHandlers: {},
  })),
}));

// Mock child components to simplify testing
vi.mock('./analytics-table-core', () => ({
  AnalyticsTableCoreClient: vi.fn(({ 'data-testid': dataTestId, sidebarSlot, controlsSlot, paginationSlot }) => (
    <div data-testid={dataTestId}>
      AnalyticsTableCore Mock
      {sidebarSlot}
      {controlsSlot}
      {paginationSlot}
    </div>
  )),
}));

vi.mock('@/components/data-table/data-table-filter-controls', () => ({
  DataTableFilterControls: vi.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId}>DataTableFilterControls Mock</div>
  )),
}));

vi.mock('@/components/data-table/data-table-filter-command', () => ({
  DataTableFilterCommand: vi.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId}>DataTableFilterCommand Mock</div>
  )),
}));

vi.mock('@/components/data-table/data-table-toolbar', () => ({
  DataTableToolbar: vi.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId}>DataTableToolbar Mock</div>
  )),
}));

vi.mock('@/components/data-table/data-table-footer-buttons', () => ({
  DataTableFooterButtons: vi.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId}>DataTableFooterButtons Mock</div>
  )),
}));

vi.mock('@/components/data-table/data-table-group-buttons', () => ({
  DataTableGroupButtons: vi.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId}>DataTableGroupButtons Mock</div>
  )),
}));

vi.mock('@/components/data-table/data-table-pagination', () => ({
  DataTablePagination: vi.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId}>DataTablePagination Mock</div>
  )),
}));


vi.mock('./components/row-edit-modal', () => ({
  RowEditModal: vi.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId}>RowEditModal Mock</div>
  )),
}));

describe('AnalyticsTable', () => {
  const mockSearch = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the component with all required elements', () => {
    render(<AnalyticsTable search={mockSearch} data={data} />);

    // Check if the main component is rendered
    expect(screen.getByTestId('analytics-table')).toBeInTheDocument();

    // Check if the sidebar is rendered
    expect(screen.getByTestId('analytics-table-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-filter-controls')).toBeInTheDocument();

    // Check if the control components are rendered
    expect(screen.getByTestId('data-table-filter-command')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-footer-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-group-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('row-edit-modal')).toBeInTheDocument();

    // Check if the pagination is rendered
    expect(screen.getByTestId('data-table-pagination')).toBeInTheDocument();
  });

  test('passes custom data to the table when provided', () => {
    // Create a mock ColumnSchema object with all required properties
    const mockData: ColumnSchema[] = [{
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      url: 'https://example.com',
      public: true,
      active: true,
      regions: [REGIONS[0]],
      tags: [TAGS[0]],
      date: new Date(),
      p95: 95,
    cost: 10,
      earning: 200,
      bigNumber: '1000000',
      btcAmount: '0.5'
    }];

    const { rerender } = render(<AnalyticsTable data={mockData} search={mockSearch} />);

    expect(screen.getByTestId('analytics-table')).toBeInTheDocument();

    // Rerender without data to test default data usage
    rerender(<AnalyticsTable search={mockSearch} />);
    expect(screen.getByTestId('analytics-table')).toBeInTheDocument();
  });
});
