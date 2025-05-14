import type { Row } from "@tanstack/react-table";
import Decimal from "decimal.js-light";


export const customSumAggregation = <T>(columnId: string, leafRows: Row<T>[]) => {

  if (leafRows.length === 0) return null;

  const sum = leafRows.reduce((acc, row) => {
    const value = String(row.getValue(columnId));
    const decimalVal = new Decimal(value);
    return acc.plus(decimalVal);
  }, new Decimal(0));
  return sum.toString();
};
