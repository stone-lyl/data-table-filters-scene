import { formatCurrency, formatBtcAmount, formatBigNumber } from '@/app/analyze/util/formatters';

export type FormatterFn = (value: any) => string;

/**
 * Creates a formatter function based on format type and accessor key
 * @param options Format options and accessor key
 * @returns A formatter function that takes a value and returns a formatted string
 */
export const createFormatter = ({
  format,
  accessorKey,
}: {
  format: {
    type: string;
    unit?: string;
  };
  accessorKey: string;
}): FormatterFn => {
  return (value: any) => {
    if (value === null || value === undefined) return '';
    
    // Convert string values to numbers if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value as number;
    
    if (format.type === 'currency') {
      const unit = format.unit || 'USD';
      if (unit === 'BTC') {
        return `${formatBtcAmount(numValue.toString())} BTC`;
      } else {
        return `$${formatCurrency(numValue)}`;
      }
    } else if (accessorKey.includes('hashrate')) {
      return `${(numValue * 100).toFixed(2)}%`;
    } else if (accessorKey.includes('efficiency')) {
      return `${numValue.toFixed(2)}%`;
    } else {
      // Default number formatting
      return formatBigNumber(numValue.toString());
    }
  };
};
