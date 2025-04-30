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
import { ColumnInfoTooltip } from "./column-info-tooltip";
import { ColumnSchema } from "./types";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultColumnFilters?: ColumnFiltersState;
  defaultGrouping?: GroupingState;
  // TODO: add sortingColumnFilters
  filterFields?: DataTableFilterField<TData>[];
  // Footer configuration
  footerAggregations?: AggregationConfig[];
  getColumnAggregation?: (columnId: string, type: string, values: any[]) => React.ReactNode;
  // Row event handlers
  onRow?: (record: any, rowIndex: number) => any;
  onHeaderRow?: (columns: any, index: number) => any;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  defaultColumnFilters = [],
  defaultGrouping = [],
  filterFields = [],
  footerAggregations: defaultFooterAggregations,
  getColumnAggregation,
  onRow: externalRowHandler,
  onHeaderRow: externalHeaderRowHandler,
}: DataTableProps<TData, TValue>) {
  // State for data management
  const [data, setData] = useState<any[]>(initialData);
  
  // State for row edit modal
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for column info tooltip
  const [tooltipInfo, setTooltipInfo] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Handle row updates
  const handleRowUpdate = (updatedData: any) => {
    setData(prevData => 
      prevData.map(row => {
        // Use a unique identifier for your data, url is used as an example
        if ('url' in row && 'url' in updatedData && row.url === updatedData.url) {
          return updatedData;
        }
        return row;
      })
    );
  };

  // Handle row deletion
  const handleRowDelete = (rowToDelete: any) => {
    setData(prevData => 
      prevData.filter(row => {
        // Use a unique identifier for your data
        if ('url' in row && 'url' in rowToDelete) {
          return row.url !== rowToDelete.url;
        }
        return true;
      })
    );
  };

  // Row event handlers
  const rowEventHandlers = (record: any, rowIndex: number) => {
    // Combine internal handlers with any external handlers
    const internalHandlers = {
      onDoubleClick: (e: React.MouseEvent) => {
        setSelectedRow(record);
        setIsModalOpen(true);
        console.log('Row double clicked:', record);
      },
      onClick: (e: React.MouseEvent) => {
        // Optional click handler
        console.log('Row clicked:', record);
      },
      onContextMenu: (e: React.MouseEvent) => {
        // Optional context menu handler
        e.preventDefault();
        console.log('Row right-clicked:', record);
      },
      onMouseEnter: (e: React.MouseEvent) => {
        // Optional mouse enter handler
        console.log('Mouse entered row:', rowIndex);
      },
      onMouseLeave: (e: React.MouseEvent) => {
        // Optional mouse leave handler
        console.log('Mouse left row:', rowIndex);
      }
    };

    // If external handlers are provided, merge them with internal handlers
    if (externalRowHandler) {
      const externalHandlers = externalRowHandler(record, rowIndex);
      return { ...internalHandlers, ...externalHandlers };
    }

    return internalHandlers;
  };

  // Header row event handlers
  const headerRowEventHandlers = (columns: any, index: number) => {
    // Combine internal handlers with any external handlers
    const internalHandlers = {
      onClick: (e: React.MouseEvent) => {
        // Optional click handler
        console.log('Header row clicked:', columns);
      },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
        // Show tooltip with column info
        setTooltipPosition({ x: e.clientX, y: e.clientY });
        setTooltipInfo(columns);
        setIsTooltipOpen(true);
      }
    };

    // If external handlers are provided, merge them with internal handlers
    if (externalHeaderRowHandler) {
      const externalHandlers = externalHeaderRowHandler(columns, index);
      return { ...internalHandlers, ...externalHandlers };
    }

    return internalHandlers;
  };
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
    React.useState<AggregationConfig[]>(defaultFooterAggregations || []);
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

  return (
    <>
      {/* Column Info Tooltip */}
      <ColumnInfoTooltip
        isOpen={isTooltipOpen}
        onClose={() => setIsTooltipOpen(false)}
        position={tooltipPosition}
        columnInfo={tooltipInfo}
      >
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: isTooltipOpen ? 'auto' : 'none', opacity: 0 }} />
      </ColumnInfoTooltip>
      
      {/* Row Edit Modal */}
      <RowEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rowData={selectedRow}
        onSave={handleRowUpdate}
        onDelete={handleRowDelete}
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
        <div
          className={cn(
            "hidden w-full p-1 sm:block sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-64 md:max-w-64",
            "group-data-[expanded=false]/controls:hidden",
          )}
        >
          <DataTableFilterControls />
        </div>
        <div className="flex max-w-full flex-1 flex-col gap-4 overflow-hidden p-1">
          <DataTableFilterCommand searchParamsParser={searchParamsParser} />
          <DataTableToolbar />
          <DataTableFooterButtons />
          <DataTableGroupButtons />
          <div className="rounded-md border">
            <AnalyzeTable 
              getColumnAggregation={getColumnAggregation} 
              onRow={rowEventHandlers}
              onHeaderRow={headerRowEventHandlers}
            />
          </div>
          <DataTablePagination />
        </div>
      </div>
    </DataTableProvider>
    </>
  );
}
