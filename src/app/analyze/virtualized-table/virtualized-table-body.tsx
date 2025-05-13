import { RowEventHandlersFn } from "@/app/analyze/types/event-handlers";
import { DataTableFooterProps } from "@/app/analyze/virtualized-table/virtualized-table-footer";
import { TableBody, TableCell, TableRow } from "@/components/custom/table";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Cell, flexRender, Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

type VirtualizedTableBodyProps<TData> = {
  onRow?: RowEventHandlersFn<TData>;
} & DataTableFooterProps<TData>;
export const VirtualizedTableBody = <TData,>({
  virtualColumns,
  virtualPadding,
  onRow,
}: VirtualizedTableBodyProps<TData>) => {
  const { table } = useDataTable();
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
          {flexRender(cell.column.columnDef.cell, cell.getContext())} (
          {row.subRows.length})
        </Button>
      );
    }

    // Aggregated cells
    if (cell.getIsAggregated()) {
      // Skip content for dimension columns
      if (cell.column.columnDef.meta?.fieldType === "dimension") {
        return null;
      }
      return flexRender(cell.column.columnDef.cell, cell.getContext());
    }

    // Placeholder cells
    if (cell.getIsPlaceholder()) {
      return null;
    }

    // Normal cells
    return flexRender(cell.column.columnDef.cell, cell.getContext());
  };
  return (
    <TableBody className="grid" data-testid="table-body">
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row: any) => (
          <TableRow
            data-testid={`table-row-${row.id}`}
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className={cn(
              row.getIsSelected() ? "bg-muted" : "hover:bg-muted/50",
              row.getIsExpanded() ? "bg-muted/50" : "",
              "flex",
            )}
            {...(onRow ? onRow(row as Row<TData>, row.index) : {})}
          >
            {virtualPadding.left ? (
              <td
                className={cn("virtual-left", "flex")}
                style={{
                  width: `${virtualPadding.left}px`,
                }}
              />
            ) : null}
            {virtualColumns.map((virtualColumn) => {
              const cell = row.getVisibleCells()[virtualColumn.index];
              if (!cell) return null;

              // Common cell style for all cell types
              const cellStyle = {
                width: `${virtualColumn.size}px`,
                height: "100%",
              };

              // Get cell content using the helper method
              const cellContent = getCellContent(
                cell as Cell<TData, unknown>,
                row as Row<TData>,
              );

              return (
                <TableCell
                  data-testid={`table-cell-${cell.id}`}
                  key={cell.id}
                  style={cellStyle}
                >
                  {cellContent}
                </TableCell>
              );
            })}
            {virtualPadding.right ? (
              <td
                className={cn("virtual-right", "flex")}
                style={{
                  width: `${virtualPadding.right}px`,
                }}
              />
            ) : null}
          </TableRow>
        ))
      ) : (
        <TableRow data-testid="empty-row">
          <TableCell
            data-testid="empty-cell"
            colSpan={virtualColumns.length}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};
