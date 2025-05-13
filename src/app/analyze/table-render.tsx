"use client";

import * as React from "react";
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
import { Cell, flexRender, Header, Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTableFooter } from "./data-table-footer";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { RowEventHandlersFn, HeaderRowEventHandlersFn } from "./types/event-handlers";
import { cn } from "@/lib/utils";
import style from "styled-jsx/style";

interface TableRenderProps<TData> {
  onRow?: RowEventHandlersFn<TData>;
  onHeaderRow?: HeaderRowEventHandlersFn<TData>;
  tableClassName?: string;
}

export const FIXED_HEIGHT = 24;
const TOOLTIPT_MAX_HEIGHT = FIXED_HEIGHT * 11;

export function TableRender<TData>({
  onRow,
  onHeaderRow,
  tableClassName
}: TableRenderProps<TData>) {
  // Helper method to get cell content based on cell type
  const getCellContent = (cell: Cell<TData, unknown>, row: Row<TData>) => {
    // Grouped cells
    if (cell.getIsGrouped()) {
      return (
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
      );
    }

    // Aggregated cells
    if (cell.getIsAggregated()) {
      // Skip content for dimension columns
      if (cell.column.columnDef.meta?.fieldType === 'dimension') {
        return null;
      }
      return flexRender(
        cell.column.columnDef.cell,
        cell.getContext()
      );
    }

    // Placeholder cells
    if (cell.getIsPlaceholder()) {
      return null;
    }

    // Normal cells
    return flexRender(
      cell.column.columnDef.cell,
      cell.getContext()
    );
  };
  const { table } = useDataTable();
  const columns = table.getVisibleFlatColumns();

  
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const columnVirtualizer = useVirtualizer({
    count: columns.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: (index) => {
      return columns[index]?.getSize() || 150;
    },
    horizontal: true,
    overscan: 2,
  });

  const virtualColumns = columnVirtualizer.getVirtualItems();

  const calcTotalWidth = () => {
      if (columnVirtualizer.getTotalSize() > 1200) {
        return 1200;
      }
      return columnVirtualizer.getTotalSize();
  }

  //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
  let virtualPaddingLeft: number | null = null;
  let virtualPaddingRight: number | null = null;

  if (columnVirtualizer && virtualColumns?.length) {
    virtualPaddingLeft = virtualColumns[0]?.start ?? null
    virtualPaddingRight =
      columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1]?.end ?? null)
  }

  console.log(calcTotalWidth(), 'calcTotalWidth()')
  console.log(columnVirtualizer.getTotalSize(), 'columnVirtualizer.getTotalSize()')
  return (
    <div>
      <div>
        <Table
          data-testid="analytics-table-main"
          ref={tableContainerRef}
          className={cn(tableClassName, 'border-separate border-spacing-0 w-full table-fixed relative grid')}
          style={{
            width: `${calcTotalWidth()}px`,
          }}
          containerClassName="rounded-md border"
        >
          <TableHeader
            data-testid="table-header"
            className="bg-background sticky top-0 z-20 grid">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                data-testid={`header-row-${headerGroup.id}`}
                key={headerGroup.id}
                className="relative w-full flex"
              >
                {virtualPaddingLeft ? (
                  <th
                    className={cn('virtual-left', 'flex')}
                    style={{
                      width: `${virtualPaddingLeft}px`,
                    }}
                  />
                ): null}
                {virtualColumns.map(virtualColumn => {
                  const header = headerGroup.headers[virtualColumn.index];
                  if (!header) return null;
                  console.log('virtualColumn.size', virtualColumn.size, 'header.getSize()', header.getSize())
                  return (
                    <TableHead
                      data-testid={`header-cell-${header.id}`}
                      key={header.id}
                      className="select-none truncate border-b border-border bg-muted/50 flex items-center"
                      style={{
                        // position: 'absolute',
                        // transform: `translateX(${virtualColumn.start}px)`,
                        width: `${header.getSize()}px`,
                        // height: '100%'
                      }}
                      {...(onHeaderRow ? onHeaderRow(headerGroup.headers as Header<TData, unknown>[], virtualColumn.index) : {})}
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
                {virtualPaddingRight ? (
                  <th
                    className={cn('virtual-right', 'flex')}
                    style={{
                      width: `${virtualPaddingRight}px`,
                    }}
                  />
                ) : null}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="grid" data-testid="table-body">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-testid={`table-row-${row.id}`}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    row.getIsSelected() ? "bg-muted" : "hover:bg-muted/50",
                    row.getIsExpanded() ? "bg-muted/50" : "",
                    "flex"
                  )}
                  {...(onRow ? onRow(row as Row<TData>, row.index) : {})}
                >
                  {virtualPaddingLeft ? (
                    <td
                      className={cn('virtual-left', 'flex')}
                      style={{
                        width: `${virtualPaddingLeft}px`,
                      }}
                    />
                  ) : null}
                  {virtualColumns.map(virtualColumn => {
                    const cell = row.getVisibleCells()[virtualColumn.index];
                    if (!cell) return null;

                    // Common cell style for all cell types
                    const cellStyle = {
                      width: `${virtualColumn.size}px`,
                      height: '100%'
                    };

                    // Get cell content using the helper method
                    const cellContent = getCellContent(cell as Cell<TData, unknown>, row as Row<TData>);

                    return (
                      <TableCell
                        data-testid={`table-cell-${cell.id}`}
                        key={cell.id}
                        style={cellStyle}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })
                }
                {virtualPaddingRight ? (
                  <td
                    className={cn('virtual-right', 'flex')}
                    style={{
                      width: `${virtualPaddingRight}px`,
                    }}
                  />
                ) : null}
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
          {/* <DataTableFooter
            data-testid="data-table-footer"
          /> */}
        </Table>
      </div>
    </div>
  );
}
