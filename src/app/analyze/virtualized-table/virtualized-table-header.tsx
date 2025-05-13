import { HeaderRowEventHandlersFn } from "@/app/analyze/types/event-handlers";
import { DataTableFooterProps } from "@/app/analyze/virtualized-table/virtualized-table-footer";
import { TableHead, TableHeader, TableRow } from "@/components/custom/table";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { cn } from "@/lib/utils";
import { flexRender, Header } from "@tanstack/react-table";
import * as React from "react";

type VirtualizedTableHeaderProps<TData> = {
  onHeaderRow?: HeaderRowEventHandlersFn<TData>;
} & DataTableFooterProps<TData>;
export const VirtualizedTableHeader = <TData,>({
  virtualColumns,
  virtualPadding,
  onHeaderRow,
}: VirtualizedTableHeaderProps<TData>) => {
  const { table } = useDataTable();
  return (
    <TableHeader
      data-testid="table-header"
      className="sticky top-0 z-20 grid bg-background"
    >
      {table.getHeaderGroups().map((headerGroup: any) => (
        <TableRow
          data-testid={`header-row-${headerGroup.id}`}
          key={headerGroup.id}
          className="relative flex w-full"
        >
          {virtualPadding.left ? (
            <th
              className={cn("virtual-left", "flex")}
              style={{
                width: `${virtualPadding.left}px`,
              }}
            />
          ) : null}
          {virtualColumns.map((virtualColumn) => {
            const header = headerGroup.headers[virtualColumn.index];
            if (!header) return null;
            console.log('header size', header.getSize());
            console.log('header id', virtualColumn.size);
            return (
              <TableHead
                data-testid={`header-cell-${header.id}`}
                key={header.id}
                className="flex text-ellipsis whitespace-nowrap overflow-hidden select-none items-center truncate border-b border-border bg-muted/50"
                style={{
                  width: `${virtualColumn.size}px`,
                }}
                {...(onHeaderRow
                  ? onHeaderRow(
                      headerGroup.headers as Header<TData, unknown>[],
                      virtualColumn.index,
                    )
                  : {})}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            );
          })}
          {virtualPadding.right ? (
            <th
              className={cn("virtual-right", "flex")}
              style={{
                width: `${virtualPadding.right}px`,
              }}
            />
          ) : null}
        </TableRow>
      ))}
    </TableHeader>
  );
};
