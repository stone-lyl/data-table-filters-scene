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

interface RowEventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}

interface HeaderRowEventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

interface AnalyzeTableProps<TData> {
  getColumnAggregation?: (columnId: string, type: AggregationType, values: unknown[]) => React.ReactNode;
  onRow?: (row: Row<TData>, rowIndex: number) => RowEventHandlers;
  onHeaderRow?: (columns: Header<TData, unknown>[], index: number) => HeaderRowEventHandlers;
}

export function AnalyzeTable<TData>({
  getColumnAggregation,
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
      <DataTableFooter getColumnAggregation={getColumnAggregation} />
    </Table>
  );
}
