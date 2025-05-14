import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { customSum } from "@/lib/customAggregationFn";
import { ColumnStruct, NonceRecord } from '../types';
import { createFormatter } from '@/app/analyze-doc/compare/create-formatter';
import { ComparisonCellRenderer } from './comparison-cell-renderer';

/**
 * Generate columns based on columnsStruct
 * @param columnStructs The column structure definitions
 * @returns Array of column definitions
 */
export function generateColumns(columnStructs: ColumnStruct[]): ColumnDef<NonceRecord, unknown>[] {
  const columns: ColumnDef<NonceRecord, unknown>[] = [];
  columnStructs.forEach(colStruct => {
    const accessorKey = colStruct.dataIndex;
    const valueFormatter = createFormatter({
      format: colStruct.meta?.format || { type: colStruct.type },
      accessorKey: accessorKey
    });
    const columnDef: ColumnDef<NonceRecord, unknown> = {
      accessorFn: (row) => {
        return row[accessorKey];
      },
      id: accessorKey,
      header: ({ column }) => {
        if (column.columnDef.meta?.fieldType === 'measure') {
          return (
            <DataTableColumnHeader align='end' column={column} title={colStruct.shortTitle || colStruct.title} />
          );
        }
        return colStruct.shortTitle || colStruct.title;
      },
      aggregationFn: customSum,
      meta: {
        fieldType: colStruct.type === 'number' ? 'measure' : 'dimension',
        format: colStruct.meta?.format,
      },
    };

    // Add cell renderer based on column type
    if (colStruct.type === 'time') {
      columnDef.cell = ({ cell }) => {
        const value = cell.getValue();
        if (!value) return 'N/A';
        return valueFormatter(value);
      };
    } else if (colStruct.type === 'number') {

      columnDef.cell = (props) => {
        return (
          <ComparisonCellRenderer
            {...props}
            accessorKey={accessorKey}
            valueFormatter={valueFormatter}
          />
        );
      };
    }

    columns.push(columnDef);
  });

  return columns;
}
