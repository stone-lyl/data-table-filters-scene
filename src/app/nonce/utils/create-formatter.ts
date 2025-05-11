import { formatCurrency, formatBtcAmount, formatBigNumber } from '@/app/analyze/util/formatters';
import { format as formatDate, parseISO } from 'date-fns';

export type FormatterFn = (value: any) => string;

/**
 * Creates a formatter function based on format type and accessor key
 * @param options Format options and accessor key
 * @returns A formatter function that takes a value and returns a formatted string
 */
export interface FormatterContext {
  value: any;
  format: { type: string; unit?: string };
  accessorKey?: string;
}

export type FormatterHandler = (ctx: FormatterContext, next: FormatterHandler) => string;

export const createFormatter = ({
  format,
  accessorKey,
}: {
  format: {
    type: string;
    unit?: string;
  };
  accessorKey?: string;
}): FormatterFn => {
  return (value: any) => {
    if (value === null || value === undefined) return '';
    const ctx: FormatterContext = { value, format, accessorKey };
    return chain(ctx, defaultHandler);
  };
};

// Currency handler
export const currencyHandler: FormatterHandler = (ctx, next) => {
  const { value, format } = ctx;
  if (format.type === 'currency') {
    const numValue = typeof value === 'string' ? parseFloat(value) : value as number;
    const unit = format.unit || 'USD';
    if (unit === 'BTC') {
      return `${formatBtcAmount(numValue.toString())} BTC`;
    } else {
      return `$${formatCurrency(numValue)}`;
    }
  }
  return next(ctx, defaultHandler);
};


export const defaultHandler: FormatterHandler = (ctx, _next) => {
  const { value } = ctx;
  const numValue = typeof value === 'string' ? parseFloat(value) : value as number;
  return formatBigNumber(numValue.toString());
};

// Percentage handler
export const percentageHandler: FormatterHandler = (ctx, next) => {
  const { value, format } = ctx;
  if (format.type === 'percentage') {
    const numValue = typeof value === 'string' ? parseFloat(value) : value as number;
    return `${(numValue * 100).toFixed(2)}%`;
  }
  return next(ctx, defaultHandler);
};

// Date handler
export const dateHandler: FormatterHandler = (ctx, next) => {
  const { value, format } = ctx;
  if (format.type === 'time') {
    try {
      // Supports both ISO strings and timestamps
      const date = typeof value === 'string' ? parseISO(value) : new Date(value);
      return formatDate(date, 'yyyy/MM/dd');
    } catch {
      return String(value);
    }
  }
  return next(ctx, defaultHandler);
};

// Compose chain using array/reduceRight for extensibility
const handlers: FormatterHandler[] = [currencyHandler, dateHandler, percentageHandler];
const chain: FormatterHandler = handlers.reduceRight(
  (next, handler) => (ctx, _n) => handler(ctx, next),
  defaultHandler
);

