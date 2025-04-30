"use client";

import { TableCell, TableFooter, TableRow } from "@/components/custom/table";
import { flexRender } from "@tanstack/react-table";
import * as React from "react";
import { cn } from "@/lib/utils";
import { AggregationType } from "../../components/data-table/aggregations";
import { useDataTable } from "@/components/data-table/data-table-provider";
import Decimal from "decimal.js-light";
import { AGGREGATION_ROW } from "./common";



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

    // Determine column type based on metadata
    const isMeasure = column.columnDef.meta?.fieldType === 'measure';
    const isBoolean = values.some(v => typeof v === 'boolean');

    // Create a mock row context for rendering cells
    const createMockContext = (value: any) => {
      return {
        table,
        column,
        row: {
          getValue: () => value,
          original: { [columnId]: value },
          id: `${type}-${AGGREGATION_ROW}`,
          index: -1,
        },
        cell: {
          id: `${type}-${columnId}-aggregation`,
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
        if (isMeasure) {
          try {
            // Filter out null/undefined values
            const validValues = values.filter(v => v !== null && v !== undefined);
            if (validValues.length === 0) return null;

            const decimalSum = validValues.reduce((acc, val) => {
              const decimalVal = new Decimal(val);
              return acc.plus(decimalVal);
            }, new Decimal(0));

            const sum = decimalSum.toString();

            // If the column has a cell renderer, use it for consistent formatting
            if (columnDef.cell && typeof columnDef.cell !== 'string') {
              try {
                return flexRender(columnDef.cell, createMockContext(sum));
              } catch (e) {
                // Fallback to basic formatting
                return <span className="font-mono">{decimalSum.toFixed(2)}</span>;
              }
            }

            // Default fallback formatting
            return <span className="font-mono">{decimalSum.toFixed(2)}</span>;
          } catch (error) {
            return null; // In case of parsing errors
          }
        }
        return null;

      case 'average':
        if (isMeasure) {
          try {
            // Filter out null/undefined values
            const validValues = values.filter(v => v !== null && v !== undefined);
            if (validValues.length === 0) return null;

            // Use decimal.js-light for precise calculation regardless of value type
            const decimalSum = validValues.reduce((acc, val) => {
              // Convert all values to Decimal for consistent handling
              const decimalVal = new Decimal(val);
              return acc.plus(decimalVal);
            }, new Decimal(0));

            const decimalLength = new Decimal(validValues.length);
            const decimalAvg = decimalSum.dividedBy(decimalLength);

            // Use string for cell renderer to preserve precision
            const avg = decimalAvg.toString();

            // If the column has a cell renderer, try to use it
            if (columnDef.cell && typeof columnDef.cell !== 'string') {
              try {
                return flexRender(columnDef.cell, createMockContext(avg));
              } catch (e) {
                // Fallback to basic formatting
                return <span className="font-mono">{decimalAvg.toFixed(2)}</span>;
              }
            }

            // Default fallback formatting
            return <span className="font-mono">{decimalAvg.toFixed(2)}</span>;
          } catch (error) {
            return null; // In case of parsing errors
          }
        }
        return null;

      case 'percentage':
        if (isBoolean) {
          const trueCount = values.filter(Boolean).length;

          // Use decimal.js-light for precise percentage calculation
          const decimalTrueCount = new Decimal(trueCount);
          const decimalTotal = new Decimal(values.length);
          const decimalPercentage = decimalTrueCount.dividedBy(decimalTotal).times(100);
          const percentage = decimalPercentage.toNumber().toFixed(2);
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
