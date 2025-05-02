import { Calculator, ArrowDownUp, Plus, Percent } from "lucide-react";
import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import Decimal from "decimal.js-light";
import { Table } from "@tanstack/react-table";
import { ColumnSchema } from "@/app/analyze/types";
import { AGGREGATION_ROW } from "@/app/analyze/common";

// Define the available aggregation types
export type AggregationType = string;

// Define the configuration for each aggregation row
export interface AggregationConfig<TData> {
  type: AggregationType;
  label: string;
  icon: React.ReactElement;
  aggregationMethod?: (columnId: string, values: any[], table: Table<TData>) => React.ReactNode;
}

// Helper function to create a mock context for cell renderers
const createMockContext = (table: Table<ColumnSchema>, columnId: string, type: string, value: any) => {
  const column = table.getColumn(columnId);
  if (!column) {
    // Return a default context if column is not found to avoid null
    return {
      table,
      column: {} as any,
      row: {
        getValue: () => value,
        original: { [columnId]: value },
        id: `${type}-fallback`,
        index: -1,
      },
      cell: {
        id: `${type}-${columnId}-fallback`,
        getValue: () => value,
      },
      renderValue: () => value,
    };
  }
  
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

// Aggregation methods
const countAggregation = (columnId: string, values: any[], table: Table<ColumnSchema>) => {
  return values.length > 0 ? values.length : null;
};

const sumAggregation = (columnId: string, values: any[], table: Table<ColumnSchema>) => {
  const column = table.getColumn(columnId);
  if (!column) return null;

  const columnDef = column.columnDef as any;
  const isMeasure = column.columnDef.meta?.fieldType === 'measure';

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
          const context = createMockContext(table, columnId, 'sum', sum);
          return flexRender(columnDef.cell, context);
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
};

const averageAggregation = (columnId: string, values: any[], table: Table<ColumnSchema>) => {
  const column = table.getColumn(columnId);
  if (!column) return null;

  const columnDef = column.columnDef as any;
  const isMeasure = column.columnDef.meta?.fieldType === 'measure';

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

      const avg = decimalAvg.toString();

      if (columnDef.cell && typeof columnDef.cell !== 'string') {
        try {
          const context = createMockContext(table, columnId, 'average', avg);
          return flexRender(columnDef.cell, context);
        } catch (e) {
          return <span className="font-mono">{decimalAvg.toFixed(2)}</span>;
        }
      }
      return <span className="font-mono">{decimalAvg.toFixed(2)}</span>;
    } catch (error) {
      return null; // In case of parsing errors
    }
  }
  return null;
};

const percentageAggregation = (columnId: string, values: any[], table: Table<ColumnSchema>) => {
  const isBoolean = values.some(v => typeof v === 'boolean');
  
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
};

// Define the default aggregations with their respective aggregation methods
export const defaultAggregations: AggregationConfig<ColumnSchema>[] = [
  { 
    type: 'count', 
    label: 'Count', 
    icon: <Calculator className="h-4 w-4 text-muted-foreground" />,
    aggregationMethod: countAggregation
  },
  { 
    type: 'average', 
    label: 'Avg', 
    icon: <ArrowDownUp className="h-4 w-4 text-muted-foreground" />,
    aggregationMethod: averageAggregation
  },
  { 
    type: 'sum', 
    label: 'Sum', 
    icon: <Plus className="h-4 w-4 text-muted-foreground" />,
    aggregationMethod: sumAggregation
  },
  { 
    type: 'percentage', 
    label: 'Percentage', 
    icon: <Percent className="h-4 w-4 text-muted-foreground" />,
    aggregationMethod: percentageAggregation
  }
];
