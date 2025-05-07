"use client";

import { TableCell, TableFooter, TableRow } from "@/components/custom/table";
import * as React from "react";
import { cn } from "@/lib/utils";
import { AggregationType } from "../../components/data-table/data-table-aggregations";
import { useDataTable } from "@/components/data-table/data-table-provider";

export interface DataTableFooterProps<TData> {
  sticky?: boolean;
}

export function DataTableFooter<TData>({ sticky }: DataTableFooterProps<TData>) {
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

  const getAggregation = (columnId: string, type: AggregationType, values: any[]): React.ReactNode => {
    if (values.length === 0) return null;
    const aggregationConfig = footerAggregations.find(agg => agg.type === type);

    if (aggregationConfig?.aggregationMethod) {
      return aggregationConfig.aggregationMethod(columnId, values, table);
    }
    const column = table.getColumn(columnId);
    if (!column) return null;
    return null;
  };

  return (
    <TableFooter 
      data-testid="table-footer" 
      className={cn("bg-background", sticky ? 'sticky bottom-0 z-20' : '')} 
    >
      {footerAggregations.map((aggregation, index) => (
        <TableRow
          data-testid={`footer-row-${aggregation.type}`}
          key={`${aggregation.type}-row`}
          className={cn("bg-muted/50 hover:bg-muted/50 border-t")}
        >
          {columns.map((column, colIndex) => {
            const columnId = column.id;
            const values = getColumnValues(columnId, aggregation.isTotal);
            const content = getAggregation(columnId, aggregation.type, values);
            return (
              <TableCell
                data-testid={`footer-cell-${aggregation.type}-${columnId}`}
                key={`${aggregation.type}-${columnId}`}
                className={cn("font-medium relative select-none truncate border-t border-border")}
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
