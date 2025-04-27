"use client";

import { TableCell, TableFooter, TableRow } from "@/components/custom/table";
import { Calculator, ArrowDownUp, Plus, Percent } from "lucide-react";
import { Table, flexRender } from "@tanstack/react-table";
import * as React from "react";
import { cn } from "@/lib/utils";

// Define the available aggregation types
export type AggregationType = 'count' | 'sum' | 'average' | 'percentage';

// Define the configuration for each aggregation row
export interface AggregationConfig {
  type: AggregationType;
  label: string;
  icon: React.ReactNode;
}

// Define props for the DataTableFooter component
export interface DataTableFooterProps<TData> {
  table: Table<TData>;
  aggregations?: AggregationConfig[];
  formatters?: Record<string, (value: any) => React.ReactNode>;
  getColumnAggregation?: (columnId: string, type: AggregationType, values: any[]) => React.ReactNode;
}

export function DataTableFooter<TData>({
  table,
  aggregations = [
    { type: 'count', label: 'Count', icon: <Calculator className="h-4 w-4 text-muted-foreground" /> },
    { type: 'average', label: 'Average', icon: <ArrowDownUp className="h-4 w-4 text-muted-foreground" /> },
    { type: 'sum', label: 'Sum', icon: <Plus className="h-4 w-4 text-muted-foreground" /> },
    { type: 'percentage', label: 'Percentage', icon: <Percent className="h-4 w-4 text-muted-foreground" /> }
  ],
  formatters = {},
  getColumnAggregation,
}: DataTableFooterProps<TData>) {
  // Get only the current page rows
  const pageRows = table.getRowModel().rows;
  const columns = table.getAllColumns();

  // Default formatter for currency values
  const defaultFormatters = {
    currency: (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
  };

  // Combine default formatters with user-provided ones
  const allFormatters = { ...defaultFormatters, ...formatters };

  // Default implementation for column aggregation
  const defaultGetColumnAggregation = (columnId: string, type: AggregationType, values: any[]): React.ReactNode => {
    // Skip empty values
    if (values.length === 0) return null;

    // Get column definition if available
    const column = table.getColumn(columnId);
    if (!column) return null;

    const columnDef = column.columnDef as any;
    
    // Determine column type based on data values
    const isNumeric = values.some(v => typeof v === 'number') && columnId !== 'active' && columnId !== 'public';
    const isBoolean = values.some(v => typeof v === 'boolean') || columnId === 'active' || columnId === 'public';
    const isCurrency = columnId === 'cost';

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

          // Fallback formatting
          if (isCurrency && allFormatters.currency) {
            return <span className="font-mono">{allFormatters.currency(sum)}</span>;
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
          const roundedAvg = avg;

          // If the column has a cell renderer, try to use it
          if (columnDef.cell && typeof columnDef.cell !== 'string') {
            try {
              return flexRender(columnDef.cell, createMockContext(roundedAvg));
            } catch (e) {
              // Fallback
              return <span className="font-mono">{roundedAvg.toFixed(2)}</span>;
            }
          }

          // Fallback formatting
          if (isCurrency && allFormatters.currency) {
            return <span className="font-mono">{allFormatters.currency(avg)}</span>;
          }

          return <span className="font-mono">{roundedAvg.toFixed(2)}</span>;
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
    <TableFooter className="bg-transparent">
      {aggregations.map((aggregation, index) => (
        <TableRow
          key={`${aggregation.type}-row`}
          className={cn(
            "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
            index === 0 ? 'border-t border-muted' : ''
          )}
        >
          {columns.map((column, colIndex) => {
            const columnId = column.id;

            // Get values for this column
            const values = pageRows.map(row => row.getValue(columnId));
            console.log(values, 'values', values.length);
            const content = getAggregation(columnId, aggregation.type, values);

            return (
              <TableCell key={`${aggregation.type}-${columnId}`} className="font-medium">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 h-2 text-xs text-black">
                    {colIndex === 0 ? aggregation.label : ''}
                  </div>
                  {content}
                </div>
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableFooter>
  );
}
