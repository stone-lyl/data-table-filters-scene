"use client";

import { DataTableProvider } from "@/components/data-table/data-table-provider";
import type { DataTableFilterField } from "@/components/data-table/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AggregationConfig } from "../../components/data-table/aggregations";
import { AnalyzeTable } from "./analyze-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table as TTable,
  VisibilityState,
  GroupingState,
  ExpandedState,
  Row,
  Header,
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
import { useQueryStates } from "nuqs";
import * as React from "react";
import { searchParamsParser } from "./search-params";
import { RowEventHandlersFn, HeaderRowEventHandlersFn } from "./types/event-handlers";

export interface DataTableProps<TData, TValue> {
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
}

export function DataTable<TData, TValue>({
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
}: DataTableProps<TData, TValue>) {
  "use no memo"
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [grouping, setGrouping] = React.useState<GroupingState>(defaultGrouping);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>("data-table-visibility", {});
  const [footerAggregations, setFooterAggregations] =
    React.useState<AggregationConfig<TData>[]>(defaultFooterAggregations || []);
  const [_, setSearch] = useQueryStates(searchParamsParser);
  
  // Function to handle data changes
  const handleDataChange = (newData: TData[]) => {
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const table = useReactTable({
    data,
    columns,
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

    setSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  return (
    <>
      <DataTableProvider
        table={table}
        data={data}
        onDataChange={handleDataChange}
        columns={columns}
        filterFields={filterFields}
        columnFilters={columnFilters}
        sorting={sorting}
        pagination={pagination}
        grouping={grouping}
        footerAggregations={footerAggregations}
        setFooterAggregations={setFooterAggregations}
      >

        <div className="flex h-full w-full flex-col gap-3 sm:flex-row">
          {sidebarSlot}

          <div className="flex max-w-full flex-1 flex-col gap-4 overflow-hidden p-1">
            {controlsSlot }

            <div className="rounded-md border">
              <AnalyzeTable<TData>
                onRow={rowEventHandlers}
                onHeaderRow={headerRowEventHandlers}
              />
            </div>

            {paginationSlot}
          </div>
        </div>
      </DataTableProvider>
    </>
  );
}
