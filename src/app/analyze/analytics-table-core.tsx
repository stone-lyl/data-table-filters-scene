"use client";

import { DataTableProvider } from "@/components/data-table/data-table-provider";
import type { DataTableFilterField } from "@/components/data-table/types";
import { AggregationConfig } from "../../components/data-table/data-table-aggregations";
import { TableRender } from "./table-render";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table as TTable,
  VisibilityState,
  GroupingState,
  ExpandedState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getGroupedRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import * as React from "react";
import { RowEventHandlersFn, HeaderRowEventHandlersFn } from "./types/event-handlers";

// todo prop add js doc
export interface AnalyticsTableCoreProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDataChange?: (data: TData[]) => void;
  defaultColumnFilters?: ColumnFiltersState;
  defaultGrouping?: GroupingState;
  // TODO: add sortingColumnFilters
  filterFields?: DataTableFilterField<TData>[];
  // Footer configuration
  footerAggregations?: AggregationConfig<TData>[];
  // Slots for custom components
  sidebarSlot?: React.ReactNode;
  controlsSlot?: React.ReactNode;
  paginationSlot?: React.ReactNode;
  // Event handlers
  rowEventHandlers?: RowEventHandlersFn<TData>;
  headerRowEventHandlers?: HeaderRowEventHandlersFn<TData>;
  // pageSize
  pageSize?: number;
  // table className
  tableClassName?: string;
  // Column visibility state (moved from internal state)
  columnVisibility?: VisibilityState;
  setColumnVisibility?: OnChangeFn<VisibilityState>;
  // Search state setter (moved from internal state)
  setSearch?: OnChangeFn<Record<string, unknown>>;
  // Loading state
  isLoading?: boolean;
  // Custom loading component
  loadingComponent?: React.ReactNode;
}
const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center w-full h-64">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-gray-500">Loading data...</p>
    </div>
  </div>
);


export function AnalyticsTableCore<TData, TValue>({
  columns,
  data,
  onDataChange,
  defaultColumnFilters = [],
  defaultGrouping = [],
  filterFields = [],
  footerAggregations: defaultFooterAggregations,
  sidebarSlot,
  controlsSlot,
  paginationSlot,
  rowEventHandlers,
  headerRowEventHandlers,
  pageSize,
  tableClassName,
  columnVisibility = {},
  setColumnVisibility,
  setSearch,
  isLoading = false,
  loadingComponent,
}: AnalyticsTableCoreProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [grouping, setGrouping] = React.useState<GroupingState>(defaultGrouping);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize || 10,
  });
  const [footerAggregations, setFooterAggregations] =
    React.useState<AggregationConfig<TData>[]>(defaultFooterAggregations || []);

  const handleDataChange = (newData: TData[]) => {
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  console.log(grouping, 'analytics-table-core: grouping');
  const table = useReactTable({
    data,
    columns,
    paginateExpandedRows: false,
    state: { columnFilters, sorting, columnVisibility, pagination, grouping, expanded },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableRowPinning: true,
    enablePinning: true,
    // REMINDER: it doesn't support array of strings (WARNING: might not work for other types)
    getFacetedUniqueValues: (table: TTable<TData>, columnId: string) => () => {
      const facets = getFacetedUniqueValues<TData>()(table, columnId)();
      const customFacets = new Map();
      for (const [key, value] of facets as any) {
        if (Array.isArray(key)) {
          for (const k of key) {
            const prevValue = customFacets.get(k) || 0;
            customFacets.set(k, prevValue + value);
          }
        } else {
          const prevValue = customFacets.get(key) || 0;
          customFacets.set(key, prevValue + value);
        }
      }
      return customFacets;
    },
  });

  React.useEffect(() => {
    const columnFiltersWithNullable = filterFields.map((field) => {
      const filterValue = columnFilters.find(
        (filter) => filter.id === field.value,
      );
      if (!filterValue) return { id: field.value, value: null };
      return { id: field.value, value: filterValue.value };
    });

    const search = columnFiltersWithNullable.reduce(
      (prev, curr) => {
        prev[curr.id as string] = curr.value;
        return prev;
      },
      {} as Record<string, unknown>,
    );

    setSearch?.(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  const shouldShowLoading = React.useMemo(() => {
    return isLoading || (columns.length === 0 && data.length === 0);
  }, [isLoading, columns.length, data.length]);

  const defaultLoadingComponent = <DefaultLoadingComponent />;


  return (
    <>
      <DataTableProvider
        data-testid="data-table-provider"
        columnFilters={columnFilters}
        columnVisibility={columnVisibility}
        columns={columns}
        data={data}
        filterFields={filterFields}
        footerAggregations={footerAggregations}
        grouping={grouping}
        onDataChange={handleDataChange}
        pagination={pagination}
        setFooterAggregations={setFooterAggregations}
        sorting={sorting}
        table={table}
      >

        <div data-testid="analytics-table-core-container" className="flex h-full w-full flex-col gap-3 sm:flex-row">
          {sidebarSlot}

          <div data-testid="analytics-table-core-content" className="flex max-w-full flex-1 flex-col gap-4 overflow-hidden p-1">
            {controlsSlot}

            {shouldShowLoading ? (
              <div data-testid="analytics-table-loading" className="flex h-full w-full flex-col gap-3 sm:flex-row">
                <div className="flex max-w-full flex-1 flex-col gap-4 overflow-hidden p-1">
                  {loadingComponent || defaultLoadingComponent}
                </div>
              </div>
            ) : (
              <TableRender<TData>
                data-testid="table-render"
                onRow={rowEventHandlers}
                onHeaderRow={headerRowEventHandlers}
                tableClassName={tableClassName}
              />
            )}
            {paginationSlot}
          </div>
        </div>
      </DataTableProvider>
    </>
  );
}

// https://github.com/TanStack/table/issues/5026#issuecomment-2734176414
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return children;
}

export function AnalyticsTableCoreClient<TData, TValue>(props: AnalyticsTableCoreProps<TData, TValue>) {
  return (
    <ClientOnly>
      <AnalyticsTableCore {...props} />
    </ClientOnly>
  )
}