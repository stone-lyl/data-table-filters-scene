import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { customSum } from '../analyze/util/customAggregationFn';
import { AmountComparisonCell } from '../compare/comparison-cell';
import { ColumnStruct, NonceRecord } from './types';
import { createFormatter } from './utils/create-formatter';
import { ComparePrefix } from './utils/generate-comparison-query';

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

      columnDef.cell = ({ cell, row, column }) => {
        const value = cell.getValue();
        const compareValue = row.original[`${ComparePrefix}${accessorKey}`];
        if (compareValue != null && column.columnDef.meta?.fieldType === 'measure') {
          return (
            <AmountComparisonCell
              formatter={valueFormatter}
              currentAmount={value as number}
              previousAmount={compareValue as number}
              currentDate={row.original['metrics.period.day'] as string}
              previousDate={row.original[`${ComparePrefix}metrics.period.day`] as string}
              showDate={true}
              hidePercentage />
          );
        }
        return <div className='text-end'>{valueFormatter(value)}</div>;
      };
    }

    columns.push(columnDef);
  });

  return columns;
}
