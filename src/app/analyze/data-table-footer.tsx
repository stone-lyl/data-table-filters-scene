"use client";

import { TableCell, TableFooter, TableRow } from "@/components/custom/table";
import * as React from "react";
import { cn } from "@/lib/utils";
import { AggregationType } from "../../components/data-table/data-table-aggregations";
import { useDataTable } from "@/components/data-table/data-table-provider";

export interface DataTableFooterProps<TData> {
  // No props needed anymore as we use aggregation methods directly
}

export function DataTableFooter<TData>(_props: DataTableFooterProps<TData>) {
  const { footerAggregations = [], table } = useDataTable();

  const columns = table.getVisibleFlatColumns();

  const getColumnValues = React.useCallback((columnId: string, isTotal: boolean | undefined): any[] => {
    let rows = [];
    if (isTotal) {
      const allLeafRows = table.getCoreRowModel().flatRows.filter(row => row.subRows.length === 0);
      rows = allLeafRows;
    } else {
      const pageLeafRows = table.getPaginationRowModel().flatRows
        .filter(row => row.subRows.length === 0);

      const uniqueRowsId = new Set();
      rows = pageLeafRows.filter(row => {
        if (!uniqueRowsId.has(row.id)) {
          uniqueRowsId.add(row.id);
          return true;
        }
        return false;
      });
    }

    return rows.map(row => row.getValue(columnId));
  }, [table.getCoreRowModel().flatRows, table.getPaginationRowModel().flatRows, columns]);

  // Use aggregation methods directly from the aggregation config
  const getAggregation = (columnId: string, type: AggregationType, values: any[]): React.ReactNode => {
    if (values.length === 0) return null;

    // Find the aggregation config for this type
    const aggregationConfig = footerAggregations.find(agg => agg.type === type);
    // If we have an aggregation method for this type, use it
    if (aggregationConfig?.aggregationMethod) {
      return aggregationConfig.aggregationMethod(columnId, values, table);
    }
    const column = table.getColumn(columnId);
    if (!column) return null;
    return null;
  };

  return (
    <TableFooter data-testid="table-footer" className="bg-muted/50">
      {footerAggregations.map((aggregation, index) => (
        <TableRow
          data-testid={`footer-row-${aggregation.type}`}
          key={`${aggregation.type}-row`}
          className={cn(
            index === 0 ? 'border-t' : ''
          )}
        >
          {columns.map((column, colIndex) => {
            const columnId = column.id;
            const values = getColumnValues(columnId, aggregation.isTotal);
            const content = getAggregation(columnId, aggregation.type, values);
            return (
              <TableCell
                data-testid={`footer-cell-${aggregation.type}-${columnId}`}
                key={`${aggregation.type}-${columnId}`}
                className={cn("font-medium")}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex text-xs text-muted-foreground uppercase">
                    {colIndex === 0 && aggregation.label}
                  </div>
                  <div className="text-muted-foreground">
                    {content}
                  </div>
                </div>
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableFooter>
  );
}
