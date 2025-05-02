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
import { ColumnDef, flexRender, Header, Row } from "@tanstack/react-table";
import { DataTableFooter } from "./data-table-footer";
import { AggregationType } from "@/components/data-table/aggregations";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { RowEventHandlersFn, HeaderRowEventHandlersFn } from "./types/event-handlers";

// Using the common types from types/event-handlers.ts

interface AnalyzeTableProps<TData> {
  onRow?: RowEventHandlersFn<TData>;
  onHeaderRow?: HeaderRowEventHandlersFn<TData>;
}

export function AnalyzeTable<TData>({
  onRow,
  onHeaderRow
}: AnalyzeTableProps<TData>) {
  "use no memo";

  const { table } = useDataTable();
  const columns = table.getAllColumns();

  return (
    <Table>
      <TableHeader className="bg-muted/50">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="hover:bg-transparent"
          >
            {headerGroup.headers.map((header, index) => {
              return (
                <TableHead 
                  key={header.id}
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
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
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
                  return <TableCell key={cell.id} />;
                }
                else if (cell.getIsPlaceholder()) {
                  return <TableCell key={cell.id} />;
                }
                // For normal cells
                return (
                  <TableCell key={cell.id}>
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
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <DataTableFooter />
    </Table>
  );
}
