"use client";

import { DataTableFilterCommand } from "@/components/data-table/data-table-filter-command";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import type { DataTableFilterField } from "@/components/data-table/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { DataTableGroupButtons } from "@/components/data-table/data-table-group-buttons";
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
import { useState } from "react";
import { searchParamsParser } from "./search-params";
import { DataTableFooterButtons } from "@/components/data-table/data-table-footer-buttons";
import { RowEditModal } from "./row-edit-modal";
import { ColumnInfoTooltip, ColumnInfoTooltipProps } from "./column-info-tooltip";
import { ColumnSchema } from "./types";
import { useRowEdit } from "./hooks/use-row-edit";
import { useColumnTooltip } from "./hooks/use-column-tooltip";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  defaultColumnFilters = [],
  defaultGrouping = [],
  filterFields = [],
  footerAggregations: defaultFooterAggregations,
  sidebarSlot,
  controlsSlot,
  paginationSlot,
}: DataTableProps<TData, TValue>) {
  // State for data management
  const [data, setData] = useState<TData[]>(initialData as TData[]);

  // Use the row edit hook
  const {
    selectedRow,
    isModalOpen,
    handleRowUpdate,
    handleRowDelete,
    rowEventHandlers,
    closeModal
  } = useRowEdit<TData>({
    data,
    onDataChange: setData
  });

  // Use the column tooltip hook
  const {
    tooltipInfo,
    tooltipPosition,
    isTooltipOpen,
    headerRowEventHandlers,
    closeTooltip
  } = useColumnTooltip<TData, TValue>();

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

  // todo: extract all controls to a separate component
  return (
    <>
      <ColumnInfoTooltip
        isOpen={isTooltipOpen}
        onClose={closeTooltip}
        position={tooltipPosition}
        columnInfo={tooltipInfo as ColumnInfoTooltipProps['columnInfo']}
      >
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: isTooltipOpen ? 'auto' : 'none', opacity: 0 }} />
      </ColumnInfoTooltip>

      <RowEditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        rowData={selectedRow as ColumnSchema}
        onSave={handleRowUpdate as (updatedData: ColumnSchema) => void}
        onDelete={handleRowDelete as (rowToDelete: ColumnSchema) => void}
      />
      <DataTableProvider
        table={table}
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
          {/* Sidebar slot */}
          {sidebarSlot ? (
            sidebarSlot
          ) : (
            <div
              className={cn(
                "hidden w-full p-1 sm:block sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-64 md:max-w-64",
                "group-data-[expanded=false]/controls:hidden",
              )}
            >
              <DataTableFilterControls />
            </div>
          )}
          
          <div className="flex max-w-full flex-1 flex-col gap-4 overflow-hidden p-1">
            {/* Controls slot */}
            {controlsSlot ? (
              controlsSlot
            ) : (
              <>
                <DataTableFilterCommand searchParamsParser={searchParamsParser} />
                <DataTableToolbar />
                <DataTableFooterButtons />
                <DataTableGroupButtons />
              </>
            )}
            
            <div className="rounded-md border">
              <AnalyzeTable<TData>
                onRow={rowEventHandlers}
                onHeaderRow={headerRowEventHandlers}
              />
            </div>
            
            {/* Pagination slot */}
            {paginationSlot ? paginationSlot : <DataTablePagination />}
          </div>
        </div>
      </DataTableProvider>
    </>
  );
}
