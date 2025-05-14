"use client";

import { TableCell, TableFooter, TableRow } from "@/components/custom/table";
import * as React from "react";
import { cn } from "@/lib/utils";
import { AggregationType } from "../../../components/data-table/data-table-aggregations";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";

export interface DataTableFooterProps<TData> {
    virtualColumns: VirtualItem[];
    virtualPadding: {
      left: number | null;
      right: number | null;
    };
}

export function DataTableFooter<TData>({
  virtualColumns,
  virtualPadding
 }: DataTableFooterProps<TData>) {
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
      className={cn("bg-background sticky bottom-0 z-20 grid")} 
    >
      {footerAggregations.map((aggregation, index) => (
        <TableRow
          data-testid={`footer-row-${aggregation.type}`}
          key={`${aggregation.type}-row`}
          className={cn("bg-muted/50 hover:bg-muted/50 border-t flex")}
        >
          {virtualPadding.left ? (
            <td
              className={cn('virtual-left', 'flex')}
              style={{
                width: `${virtualPadding.left}px`,
              }}
            />
          ) : null}
          
          {virtualColumns.map(virtualColumn => {
            const column = columns[virtualColumn.index];
            if (!column) return null;
            
            const columnId = column.id;
            const values = getColumnValues(columnId, aggregation.isTotal);
            const content = getAggregation(columnId, aggregation.type, values);
            const isFirstColumn = virtualColumn.index === 0;
            
            return (
              <TableCell
                data-testid={`footer-cell-${aggregation.type}-${columnId}`}
                key={`${aggregation.type}-${columnId}`}
                className={cn("font-medium select-none truncate border-t border-border text-muted-foreground flex items-center")}
                style={{
                  width: `${virtualColumn.size}px`,
                  height: '100%'
                }}
              >
                <span className="flex flex-col gap-1 w-full justify-between">
                  <span className="flex text-xs uppercase self-start">
                    {isFirstColumn && aggregation.label}
                  </span>
                  <span className="overflow-hidden inline-block text-ellipsis whitespace-nowrap self-end">
                    {content}
                  </span>
                </span>
              </TableCell>
            );
          })}
          
          {virtualPadding.right ? (
            <td
              className={cn('virtual-right', 'flex')}
              style={{
                width: `${virtualPadding.right}px`,
              }}
            />
          ) : null}
        </TableRow>
      ))}
    </TableFooter>
  );
}
