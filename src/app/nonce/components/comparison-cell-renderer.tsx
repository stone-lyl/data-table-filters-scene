import { CellContext } from "@tanstack/react-table";
import { ComparisonCell, customComparisonFormatterFactory } from "@/app/analyze-doc/compare/comparison-cell";
import { ComparePrefix } from "../utils/generate-comparison-query";
import { useMemo } from "react";
import { NonceRecord } from "../types";

export const ComparisonCellRenderer = ({
  cell,
  row,
  column,
  accessorKey,
  valueFormatter
}: CellContext<NonceRecord, unknown> & {
  accessorKey: string;
  valueFormatter: (value: any) => string;
}) => {
  const value = cell.getValue();
  const compareValue = row.original[`${ComparePrefix}${accessorKey}`];
  
  // Memoize the formatter to prevent unnecessary re-creation
  const customComparisonFormatter = useMemo(
    () => customComparisonFormatterFactory(valueFormatter, true),
    [valueFormatter]
  );
  
  // Memoize the data object to prevent unnecessary re-creation
  const comparisonData = useMemo(
    () => ({
      currentValue: value as number,
      previousValue: compareValue as number,
      currentDate: row.original['metrics.period.day'] as string,
      previousDate: row.original[`${ComparePrefix}metrics.period.day`] as string,
    }),
    [value, compareValue, row.original]
  );
  
  if (compareValue != null && column.columnDef.meta?.fieldType === 'measure') {
    return (
      <ComparisonCell
        data={comparisonData}
        showDate={true}
        customFormatter={valueFormatter}
        customComparisonFormatter={customComparisonFormatter}
      />
    );
  }
  
  return <div className='text-end'>{valueFormatter(value)}</div>;
};
