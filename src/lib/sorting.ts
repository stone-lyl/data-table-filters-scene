import Decimal from 'decimal.js-light';
import { Row } from '@tanstack/react-table';

/**
 * Decimal-aware sorting function for use in TanStack Table columns.
 * @param rowA First table row
 * @param rowB Second table row
 * @param columnId Column id to sort by
 * @returns -1, 0, or 1 for sorting
 */
export function decimalSortingFn<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string
): number {
  const valueA = rowA.getValue(columnId) as number;
  const valueB = rowB.getValue(columnId) as number;
  if (typeof valueA === 'undefined' || typeof valueB === 'undefined') {
    return 0;
  }
  try {
    const decA = new Decimal(valueA);
    const decB = new Decimal(valueB);
    return decA.comparedTo(decB);
  } catch {
    // fallback to JS comparison if decimal conversion fails
    return valueA - valueB;
  }
}
