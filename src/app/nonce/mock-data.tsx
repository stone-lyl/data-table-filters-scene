import type { FieldType } from '@/components/data-table/types';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { createFormatter } from './utils/create-formatter';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { customSum } from '../analyze/util/customAggregationFn';
import { AmountComparisonCell } from '../compare/comparison-cell';

export interface NonceRecord {
  // Cube.js data fields
  "metrics.period.day"?: string;
  "metrics.cost_usd"?: string | number;
  
  // Legacy fields for backward compatibility
  period?: string;
  earning?: number;
  cost?: number;
  hashrate?: number;
  efficiency?: number;
  onlineHashrate?: number;
  offlineHashrate?: number;
  onlineEfficiency?: number;
  offlineEfficiency?: number;
  onlineMiners?: number;
  offlineMiners?: number;
  
  // Allow for dynamic properties
  [key: string]: string | number | boolean | undefined | unknown;
}

export const defaultColumnVisibility = {
  // Cube.js data fields
  "day": true,
  "cost_usd": true,
  
  // Legacy fields for backward compatibility
  period: false,
  earning: false,
  cost: false,
  hashrate: false,
  efficiency: false,
  onlineHashrate: false,
  offlineHashrate: false,
  onlineEfficiency: false,
  offlineEfficiency: false,
  onlineMiners: false,
  offlineMiners: false,
};
// resultSet.tableColumns()
const columnsStruct = [
  {

      "key": "metrics.period.day",
      "title": "Metrics Period",
      "shortTitle": "Period",
      "type": "time",
      "dataIndex": "metrics.period.day"
  },
  {
      "key": "metrics.cost_usd",
      "type": "number",
      "meta": {
          "format": {
              "type": "currency",
              "unit": "USD"
          },
          "comparisons": [
              {
                  "type": "weekly-moving-average",
                  "member": "metrics.cost_usd_curr_week_avg"
              },
              {
                  "type": "monthly-moving-average",
                  "member": "metrics.cost_usd_curr_month_avg"
              }
          ]
      },
      "dataIndex": "metrics.cost_usd",
      "title": "Metrics Cost (USD)",
      "shortTitle": "Cost (USD)"
  }
];
// resultSet.tablePivot()
const dataStruct =[
  {
      "metrics.period.day": "2025-05-05T00:00:00.000",
      "metrics.cost_usd": "72878.0150"
  },
  {
      "metrics.period.day": "2025-05-06T00:00:00.000",
      "metrics.cost_usd": "72896.6686"
  },
  {
      "metrics.period.day": "2025-05-07T00:00:00.000",
      "metrics.cost_usd": "72824.3941"
  }
]
export type ColumnStruct =  {
  key: string;
  title: string;
  shortTitle: string;
  type: string;
  dataIndex: string;
  meta?: {
    format?: {
      type: string;
      unit?: string;
    };
    comparisons?: {
      type: string;
      member: string;
    }[];
  };
}
/**
 * Generate columns based on columnsStruct
 * @param columnStructs The column structure definitions
 * @returns Array of column definitions
 */
export function generateColumns(columnStructs: ColumnStruct[]): ColumnDef<NonceRecord, unknown>[] {
  const columns: ColumnDef<NonceRecord, unknown>[] = [];
  columnStructs.forEach(colStruct => {
    const accessorKey = colStruct.dataIndex;
    const id = accessorKey.replace(/\./g, '_');
    const columnDef: ColumnDef<NonceRecord, unknown> = {
      id,
      accessorFn: (row) => {
        return row[accessorKey];
      },
      header: ({column}) => (
        <DataTableColumnHeader column={column} title={colStruct.shortTitle || colStruct.title} />
      ),
      aggregationFn: customSum,
      meta: {
        fieldType: colStruct.type === 'time' ? 'dimension' : 'measure',
        // label: colStruct.title
      },
    };
    
    // Add cell renderer based on column type
    if (colStruct.type === 'time') {
      columnDef.cell = ({ cell }) => {
        const value = cell.getValue();
        if (!value) return '';
        return format(new Date(value as string), "yyyy-MM-dd");
      };
    } else if (colStruct.type === 'number') {

    
      // Create a formatter based on the column structure
      const formatter = createFormatter({
        format: colStruct.meta?.format || { type: 'default' },
        accessorKey: accessorKey
      });
      
      columnDef.cell = ({ cell, row, column }) => {
        // if row['Pre_<accessorKey>'] exist and the field type is measure,
        // then display a compare cell,
        // else display a normal cell
        const value = cell.getValue();
        const compareValue = row.original['Pre_' + accessorKey];
        if (compareValue != null && column.columnDef.meta?.fieldType === 'measure') {
          return (
            <AmountComparisonCell
              formatter={formatter}
              currentAmount={value as number}
              previousAmount={compareValue as number}
              currentDate={row.original['metrics.period.day'] as string}
              previousDate={row.original['Pre_metrics.period.day'] as string}
              showDate={true}
              hidePercentage
            />
          );
        }
        return formatter(value);
      };
    }
    
    columns.push(columnDef);
  });
  
  // Sort columns according to defaultColumnVisibility order
  columns.sort((a, b) => {
    const aIndex = Object.keys(defaultColumnVisibility).indexOf(a.id as string);
    const bIndex = Object.keys(defaultColumnVisibility).indexOf(b.id as string);
    
    return aIndex - bIndex;
  });

  return columns;
}
