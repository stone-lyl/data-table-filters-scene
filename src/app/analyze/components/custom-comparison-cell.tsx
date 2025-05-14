"use client";
import { formatCurrency } from "@/lib/format";
import { ComparisonCell, customComparisonFormatterFactory } from "../compare/comparison-cell";
import { useMemo } from "react";

export const CustomComparisonCell = ({ earning, cost }: { earning: number; cost: number; }) => {

  const customComparisonFormatter = useMemo(
    () => customComparisonFormatterFactory(formatCurrency, true),
    [formatCurrency]
  );


  return (<ComparisonCell
    data={{
      currentValue: earning,
      previousValue: cost,
    }}
    showDate={false}
    customComparisonFormatter={customComparisonFormatter}
  />)
}
