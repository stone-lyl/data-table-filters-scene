"use client";

import { TableCell, TableFooter, TableRow } from "@/components/custom/table";
import { flexRender } from "@tanstack/react-table";
import * as React from "react";
import { cn } from "@/lib/utils";
import { AggregationType } from "../../components/data-table/aggregations";
import { useDataTable } from "@/components/data-table/data-table-provider";



// Define props for the DataTableFooter component
export interface DataTableFooterProps<TData> {
  getColumnAggregation?: (columnId: string, type: AggregationType, values: any[]) => React.ReactNode;
}

export function DataTableFooter<TData>({
  getColumnAggregation,
}: DataTableFooterProps<TData>) {
  "use no memo";
  
  const { footerAggregations = [], table } = useDataTable();
  const pageRows = table.getRowModel().rows;
  const columns = table.getVisibleFlatColumns();


  // Default implementation for column aggregation
  const defaultGetColumnAggregation = (columnId: string, type: AggregationType, values: any[]): React.ReactNode => {
    // Skip empty values
    if (values.length === 0) return null;

    // Get column definition if available
    const column = table.getColumn(columnId);
    if (!column) return null;

    const columnDef = column.columnDef as any;
    
    // Determine column type based on data values
    const isNumeric = values.some(v => typeof v === 'number');
    const isBoolean = values.some(v => typeof v === 'boolean');

    // Create a mock row context for rendering cells
    const createMockContext = (value: any) => {
      return {
        table,
        column,
        row: {
          getValue: () => value,
          original: { [columnId]: value },
          id: 'aggregation-row',
          index: -1,
        },
        cell: {
          id: `${columnId}-aggregation`,
          getValue: () => value,
        },
        renderValue: () => value,
      };
    };

    // Format based on aggregation type and column type
    switch (type) {
      case 'count':
        return values.length > 0 ? values.length : null;

      case 'sum':
        if (isNumeric) {
          const numericValues = values.filter(v => typeof v === 'number') as number[];
          if (numericValues.length === 0) return null;

          const sum = numericValues.reduce((acc, val) => acc + val, 0);

          // If the column has a cell renderer, use it for consistent formatting
          if (columnDef.cell && typeof columnDef.cell !== 'string') {
            try {
              // Try to use the column's cell renderer for consistent formatting
              return flexRender(columnDef.cell, createMockContext(sum));
            } catch (e) {
              // Fallback to basic formatting if cell renderer fails
              return <span className="font-mono">{sum}</span>;
            }
          }

          return <span className="font-mono">{sum}</span>;
        }
        return null;

      case 'average':
        if (isNumeric) {
          const numericValues = values.filter(v => typeof v === 'number') as number[];
          if (numericValues.length === 0) return null;

          const sum = numericValues.reduce((acc, val) => acc + val, 0);
          const avg = sum / numericValues.length;

          // If the column has a cell renderer, try to use it
          if (columnDef.cell && typeof columnDef.cell !== 'string') {
            try {
              return flexRender(columnDef.cell, createMockContext(avg));
            } catch (e) {
              // Fallback
              return <span className="font-mono">{avg.toFixed(2)}</span>;
            }
          }

          return <span className="font-mono">{avg.toFixed(2)}</span>;
        }
        return null;

      case 'percentage':
        if (isBoolean) {
          const trueCount = values.filter(Boolean).length;
          const percentage = Math.round((trueCount / values.length) * 100);

          return (
            <div className="flex items-center gap-1">
              <span className="font-medium">{percentage}%</span>
              <span className="text-xs text-muted-foreground">({trueCount}/{values.length})</span>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // Use custom or default aggregation function
  const getAggregation = getColumnAggregation || defaultGetColumnAggregation;

  return (
    <TableFooter className="bg-muted/50">
      {footerAggregations.map((aggregation, index) => (
        <TableRow
          key={`${aggregation.type}-row`}
          className={cn(
            "hover:bg-transparent border-b transition-colors",
            index === 0 ? 'border-t border-muted' : ''
          )}
        >
          {columns.map((column, colIndex) => {
            const columnId = column.id;

            // Get values for this column
            const values = pageRows.map(row => row.getValue(columnId));
            const content = getAggregation(columnId, aggregation.type, values);

            return (
              <TableCell 
                key={`${aggregation.type}-${columnId}`} 
                className={cn("font-medium")}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex text-xs items-center gap-1 h-4 font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
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
