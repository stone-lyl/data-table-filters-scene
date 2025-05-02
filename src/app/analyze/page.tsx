"use client";

import * as React from "react";
import { columns } from "./columns";
import { data } from "./data";
import { filterFields } from "./constants";
import { DataTable } from "./data-table";
import { searchParamsCache, searchParamsParser } from "./search-params";
import { Skeleton } from "./skeleton";
import { defaultAggregations } from "../../components/data-table/aggregations";
import { ColumnSchema } from "./types";
import { cn } from "@/lib/utils";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTableFilterCommand } from "@/components/data-table/data-table-filter-command";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableFooterButtons } from "@/components/data-table/data-table-footer-buttons";
import { DataTableGroupButtons } from "@/components/data-table/data-table-group-buttons";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = searchParamsCache.parse(await searchParams);

  // Example custom sidebar slot
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

  // Example custom controls slot
  const customControls = (
    <>
      <DataTableFilterCommand searchParamsParser={searchParamsParser} />
      <DataTableToolbar />
      <DataTableFooterButtons />
      <DataTableGroupButtons />
    </>
  );

  // Example custom pagination slot
  const customPagination = <DataTablePagination />;

  return (
    <React.Suspense fallback={<Skeleton />}>
      <DataTable<ColumnSchema, unknown>
        columns={columns}
        data={data as ColumnSchema[]}
        filterFields={filterFields}
        defaultGrouping={[
          // "firstName"
        ]}
        defaultColumnFilters={Object.entries(search)
          .map(([key, value]) => ({
            id: key,
            value,
          }))
          .filter(({ value }) => value ?? undefined)}
        footerAggregations={defaultAggregations.slice(1, 3)}
        sidebarSlot={customSidebar}
        controlsSlot={customControls}
        paginationSlot={customPagination}
      />
    </React.Suspense>
  );
}
