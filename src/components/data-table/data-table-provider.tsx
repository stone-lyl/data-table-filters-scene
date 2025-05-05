import { DataTableFilterField } from "@/components/data-table/types";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
  GroupingState,
} from "@tanstack/react-table";
import { AggregationConfig } from "@/components/data-table/aggregations";
import { createContext, useContext, useMemo } from "react";
import { ControlsProvider } from "../../providers/controls";

// REMINDER: read about how to move controlled state out of the useReactTable hook
// https://github.com/TanStack/table/discussions/4005#discussioncomment-7303569

interface DataTableStateContextType<TData = unknown> {
  columnFilters: ColumnFiltersState;
  columnOrder: string[];
  columnVisibility: VisibilityState;
  data?: TData[];
  enableColumnOrdering: boolean;
  footerAggregations?: AggregationConfig<TData>[];
  grouping: GroupingState;
  onDataChange?: (newData: TData[]) => void;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
  setFooterAggregations?: (aggregations: AggregationConfig<TData>[]) => void;
  sorting: SortingState;
  selectedAggregation?: AggregationConfig<TData>;
  setSelectedAggregation?: (aggregation: AggregationConfig<TData>) => void;
}

interface DataTableBaseContextType<TData = unknown, TValue = unknown> {
  table: Table<TData>;
  filterFields: DataTableFilterField<TData>[];
  columns: ColumnDef<TData, TValue>[];
  isLoading?: boolean;
  getFacetedUniqueValues?: (
    table: Table<TData>,
    columnId: string,
  ) => Map<string, number>;
  getFacetedMinMaxValues?: (
    table: Table<TData>,
    columnId: string,
  ) => undefined | [number, number];
}

interface DataTableContextType<TData = unknown, TValue = unknown>
  extends DataTableStateContextType<TData>,
    DataTableBaseContextType<TData, TValue> {}

export const DataTableContext = createContext<DataTableContextType<
  any,
  any
> | null>(null);

export function DataTableProvider<TData, TValue>({
  children,
  ...props
}: Partial<DataTableStateContextType<TData>> &
  DataTableBaseContextType<TData, TValue> & {
    children: React.ReactNode;
  }) {
  const value = useMemo(
    () => ({
      ...props,
      columnFilters: props.columnFilters ?? [],
      sorting: props.sorting ?? [],
      rowSelection: props.rowSelection ?? {},
      columnOrder: props.columnOrder ?? [],
      columnVisibility: props.columnVisibility ?? {},
      pagination: props.pagination ?? { pageIndex: 0, pageSize: 10 },
      grouping: props.grouping ?? [],
      enableColumnOrdering: props.enableColumnOrdering ?? false,
      footerAggregations: props.footerAggregations,
      setFooterAggregations: props.setFooterAggregations,
      selectedAggregation: props.selectedAggregation,
      setSelectedAggregation: props.setSelectedAggregation,
    }),
    [
      props.columnFilters,
      props.sorting,
      props.rowSelection,
      props.columnOrder,
      props.columnVisibility,
      props.pagination,
      props.grouping,
      props.table,
      props.filterFields,
      props.columns,
      props.enableColumnOrdering,
      props.isLoading,
      props.getFacetedUniqueValues,
      props.getFacetedMinMaxValues,
      props.footerAggregations,
      props.setFooterAggregations,
      props.selectedAggregation,
      props.setSelectedAggregation,
    ],
  );

  return (
    <DataTableContext.Provider value={value}>
      <ControlsProvider>{children}</ControlsProvider>
    </DataTableContext.Provider>
  );
}

export function useDataTable<TData, TValue>() {
  const context = useContext(DataTableContext);

  if (!context) {
    throw new Error("useDataTable must be used within a DataTableProvider");
  }

  return context as DataTableContextType<TData, TValue>;
}
