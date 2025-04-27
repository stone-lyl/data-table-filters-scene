"use client";

import { TableCell, TableFooter, TableRow } from "@/components/custom/table";
import { Calculator, ArrowDownUp, Plus, Percent } from "lucide-react";
import { Table, ColumnDef } from "@tanstack/react-table";
import * as React from "react";

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
    const columnDef = table.getColumn(columnId)?.columnDef as any;
    const meta = columnDef?.meta || {};
    
    // Identify column types based on data or metadata
    const isNumeric = meta.isNumeric || 
      (values.some(v => typeof v === 'number') && columnId !== 'active' && columnId !== 'public');
    const isBoolean = meta.isBoolean || 
      (values.some(v => typeof v === 'boolean') || columnId === 'active' || columnId === 'public');
    const isCurrency = meta.isCurrency || columnId === 'cost';
    
    // Format based on aggregation type and column type
    switch (type) {
      case 'count':
        if (columnId === 'firstName') {
          return (
            <div className="flex items-center gap-1">
              <span className="font-medium">{values.length}</span>
              <span className="text-xs text-muted-foreground">rows</span>
            </div>
          );
        }
        return values.length > 0 ? values.length : null;
        
      case 'sum':
        if (isNumeric) {
          const numericValues = values.filter(v => typeof v === 'number') as number[];
          if (numericValues.length === 0) return null;
          
          const sum = numericValues.reduce((acc, val) => acc + val, 0);
          
          if (isCurrency && allFormatters.currency) {
            return (
              <span className="font-mono font-medium">
                {allFormatters.currency(sum)}
              </span>
            );
          }
          
          return (
            <div className="flex items-center gap-1">
              <span className="font-mono font-medium">{sum}</span>
              {columnId === 'p95' && <span className="text-xs">ms</span>}
            </div>
          );
        }
        return null;
        
      case 'average':
        if (isNumeric) {
          const numericValues = values.filter(v => typeof v === 'number') as number[];
          if (numericValues.length === 0) return null;
          
          const sum = numericValues.reduce((acc, val) => acc + val, 0);
          const avg = sum / numericValues.length;
          
          if (isCurrency && allFormatters.currency) {
            return (
              <span className="font-mono font-medium">
                {allFormatters.currency(avg)}
              </span>
            );
          }
          
          return (
            <div className="flex items-center gap-1">
              <span className="font-mono font-medium">{columnId === 'p95' ? Math.round(avg) : avg.toFixed(2)}</span>
              {columnId === 'p95' && <span className="text-xs">ms</span>}
            </div>
          );
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
    <TableFooter>
      {aggregations.map((aggregation, index) => (
        <TableRow 
          key={`${aggregation.type}-row`} 
          className={`hover:bg-muted/30 ${index === 0 ? 'border-t-2 border-muted' : ''}`}
        >
          {columns.map(column => {
            const columnId = column.id;
            
            // First column shows the aggregation type label
            if (columnId === 'firstName') {
              return (
                <TableCell key={`${aggregation.type}-${columnId}`} className="font-medium">
                  <div className="flex items-center gap-1">
                    {aggregation.icon}
                    <span>{aggregation.label}</span>
                  </div>
                </TableCell>
              );
            }
            
            // Get values for this column
            const values = pageRows.map(row => row.getValue(columnId));
            
            // Get the aggregation content
            const content = getAggregation(columnId, aggregation.type, values);
            
            // Return the cell with content or empty
            return (
              <TableCell key={`${aggregation.type}-${columnId}`}>
                {content}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableFooter>
  );
}
