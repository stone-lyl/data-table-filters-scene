"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/custom/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { flexRender, Header, Row } from "@tanstack/react-table";
import { DataTableFooter } from "./data-table-footer";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { RowEventHandlersFn, HeaderRowEventHandlersFn } from "./types/event-handlers";
import { cn } from "@/lib/utils";

interface TableRenderProps<TData> {
  onRow?: RowEventHandlersFn<TData>;
  onHeaderRow?: HeaderRowEventHandlersFn<TData>;
  tableClassName?: string;
}

export function TableRender<TData>({
  onRow,
  onHeaderRow,
  tableClassName
}: TableRenderProps<TData>) {

  const { table } = useDataTable();
  const columns = table.getAllColumns();

  return (
    <Table
      data-testid="analytics-table-main"
      className="border-separate border-spacing-0"
      containerClassName={cn(tableClassName, "rounded-md border")}
    >
      <TableHeader
        data-testid="table-header"
        className="bg-background sticky top-0 z-200">
        {table.getHeaderGroups().map((headerGroup) => (

          <TableRow
            data-testid={`header-row-${headerGroup.id}`}
            key={headerGroup.id}
            className={cn(
              "bg-muted/50 hover:bg-muted/50",
            )}
          >
            {headerGroup.headers.map((header, index) => {
              return (
                <TableHead
                  data-testid={`header-cell-${header.id}`}
                  key={header.id}
                  className="relative select-none truncate border-b border-border"
                  {...(onHeaderRow ? onHeaderRow(headerGroup.headers as Header<TData, unknown>[], index) : {})}
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
          </TableRow>
        ))}
      </TableHeader>
      <TableBody data-testid="table-body">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              data-testid={`table-row-${row.id}`}
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              {...(onRow ? onRow(row as Row<TData>, row.index) : {})}
            >
              {row.getVisibleCells().map((cell) => {
                // Add special rendering for grouped cells
                if (cell.getIsGrouped()) {
                  return (
                    <TableCell key={cell.id} colSpan={1}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-0"
                        onClick={row.getToggleExpandedHandler()}
                      >
                        {row.getIsExpanded() ? (
                          <ChevronDown className="mr-1 h-4 w-4" />
                        ) : (
                          <ChevronRight className="mr-1 h-4 w-4" />
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}{" "}
                        ({row.subRows.length})
                      </Button>
                    </TableCell>
                  );
                }
                else if (cell.getIsAggregated()) {
                  // Skip aggregation for dimension columns
                  if (cell.column.columnDef.meta?.fieldType === 'dimension') {
                    return <TableCell key={cell.id}></TableCell>
                  }

                  return (
                    <TableCell key={cell.id} className="font-medium">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                }
                else if (cell.getIsPlaceholder()) {
                  return <TableCell key={cell.id} />;
                }
                // For normal cells
                return (
                  <TableCell
                    data-testid={`table-cell-${cell.id}`}
                    key={cell.id}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow data-testid="empty-row">
            <TableCell
              data-testid="empty-cell"
              colSpan={columns.length}
              className="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <DataTableFooter
        data-testid="data-table-footer"
      />
    </Table>
  );
}
