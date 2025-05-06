"use client";

import * as React from "react";
import { useState } from "react";
import { columns } from "./const/columns";
import { data as initialData } from "./const/data";
import { filterFields } from "./const/constants";
import { AnalyticsTableCore } from "./analytics-table-core";
import { searchParamsParser } from "./const/search-params";
import { AggregationConfig, defaultAggregations } from "../../components/data-table/data-table-aggregations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useQueryStates } from "nuqs";
import { VisibilityState } from "@tanstack/react-table";
import { ColumnSchema } from "./types/types";
import { cn } from "@/lib/utils";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTableFilterCommand } from "@/components/data-table/data-table-filter-command";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableFooterButtons } from "@/components/data-table/data-table-footer-buttons";
import { DataTableGroupButtons } from "@/components/data-table/data-table-group-buttons";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { ColumnInfoTooltip } from "./components/column-info-tooltip";
import { RowEditModal } from "./components/row-edit-modal";
import { useRowEdit } from "./hooks/use-row-edit";
import { useColumnTooltip } from "./hooks/use-column-tooltip";
import { ColumnFiltersState } from "@tanstack/react-table";

interface AnalyticsTableProps {
  data?: ColumnSchema[];
  search: Record<string, unknown>;
}

export function AnalyticsTable({
  data: propData,
  search,
}: AnalyticsTableProps) {
  const [data, setData] = useState<ColumnSchema[]>(propData || initialData as ColumnSchema[]);

  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>("data-table-visibility", {});
  const [_, setSearch] = useQueryStates(searchParamsParser);

  const rowEdit = useRowEdit<ColumnSchema>({
    data,
    onDataChange: setData
  });

  const {
    rowEventHandlers
  } = rowEdit;

  const columnTooltip = useColumnTooltip<ColumnSchema, unknown>();
  const { headerRowEventHandlers } = columnTooltip;

  const customSidebar = (
    <div
      data-testid="analytics-table-sidebar"
      className={cn(
        "hidden w-full p-1 sm:block sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-64 md:max-w-64",
        "group-data-[expanded=false]/controls:hidden",
      )}
    >
      <DataTableFilterControls data-testid="data-table-filter-controls" />
    </div>
  );

  // Example custom controls slot with ColumnInfoTooltip and RowEditModal
  const customControls = (
    <>
      <DataTableFilterCommand data-testid="data-table-filter-command" searchParamsParser={searchParamsParser} />
      <DataTableToolbar data-testid="data-table-toolbar" />
      <DataTableFooterButtons data-testid="data-table-footer-buttons" />
      <DataTableGroupButtons data-testid="data-table-group-buttons" />
      <ColumnInfoTooltip data-testid="column-info-tooltip" columnTooltip={columnTooltip} />
      <RowEditModal data-testid="row-edit-modal" rowEdit={rowEdit} />
    </>
  );

  // Example custom pagination slot
  const customPagination = <DataTablePagination data-testid="data-table-pagination" />;

  return (
    <div data-testid="analytics-table">
      <AnalyticsTableCore<ColumnSchema, unknown>
        columns={columns}
        tableClassName="overflow-auto max-h-[850px]"
        data={data}
        onDataChange={setData}
        filterFields={filterFields}
        defaultGrouping={[
          // "firstName"
        ]}
        defaultColumnFilters={Object.entries(search)
          .map(([key, value]) => ({
            id: key,
            value,
          }))
          .filter(({ value }) => value ?? undefined) as ColumnFiltersState}
        footerAggregations={defaultAggregations.slice(1, 3) as unknown as AggregationConfig<ColumnSchema>[]}
        sidebarSlot={customSidebar}
        controlsSlot={customControls}
        paginationSlot={customPagination}
        rowEventHandlers={rowEventHandlers}
        headerRowEventHandlers={headerRowEventHandlers}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        setSearch={setSearch}
      />
    </div>
  );
}
