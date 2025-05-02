"use client";

import * as React from "react";
import { useState } from "react";
import { columns } from "./columns";
import { data as initialData } from "./data";
import { filterFields } from "./constants";
import { DataTable } from "./data-table";
import { searchParamsParser } from "./search-params";
import { defaultAggregations } from "../../components/data-table/aggregations";
import { ColumnSchema } from "./types";
import { cn } from "@/lib/utils";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTableFilterCommand } from "@/components/data-table/data-table-filter-command";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableFooterButtons } from "@/components/data-table/data-table-footer-buttons";
import { DataTableGroupButtons } from "@/components/data-table/data-table-group-buttons";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { ColumnInfoTooltip } from "./column-info-tooltip";
import { RowEditModal } from "./row-edit-modal";
import { useRowEdit } from "./hooks/use-row-edit";
import { useColumnTooltip } from "./hooks/use-column-tooltip";
import { ColumnFiltersState } from "@tanstack/react-table";

interface ToolbarAndAnalyzeTableProps {
  data?: ColumnSchema[];
  search: Record<string, any>;
}

export function ToolbarAndAnalyzeTable({
  data: propData,
  search,
}: ToolbarAndAnalyzeTableProps) {
  'use no memo';
  const [data, setData] = useState<ColumnSchema[]>(propData || initialData as ColumnSchema[]);
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
      className={cn(
        "hidden w-full p-1 sm:block sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-64 md:max-w-64",
        "group-data-[expanded=false]/controls:hidden",
      )}
    >
      <DataTableFilterControls />
    </div>
  );

  // Example custom controls slot with ColumnInfoTooltip and RowEditModal
  const customControls = (
    <>
      <DataTableFilterCommand searchParamsParser={searchParamsParser} />
      <DataTableToolbar />
      <DataTableFooterButtons />
      <DataTableGroupButtons />
      <ColumnInfoTooltip columnTooltip={columnTooltip} />
      <RowEditModal rowEdit={rowEdit} />
    </>
  );

  // Example custom pagination slot
  const customPagination = <DataTablePagination />;

  return (
    <DataTable<ColumnSchema, unknown>
      columns={columns}
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
      footerAggregations={defaultAggregations.slice(1, 3)}
      sidebarSlot={customSidebar}
      controlsSlot={customControls}
      paginationSlot={customPagination}
      rowEventHandlers={rowEventHandlers}
      headerRowEventHandlers={headerRowEventHandlers}
    />
  );
}
