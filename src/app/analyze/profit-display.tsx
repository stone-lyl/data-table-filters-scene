"use client";
import { formatCurrency } from "./formatters";
import Decimal from "decimal.js-light";

// Profit display component
export const ProfitDisplay = ({ earning, cost }: { earning: number; cost: number; }) => {
  // Calculate profit and profit rate using Decimal for precision
  const decimalEarning = new Decimal(earning);
  const decimalCost = new Decimal(cost);
  const profit = decimalEarning.minus(decimalCost);
  
  // Calculate profit rate with proper decimal handling
  const profitRate = decimalCost.isZero() 
    ? new Decimal(0) 
    : profit.dividedBy(decimalCost).times(100).absoluteValue();

  // Determine color based on profit (positive = pink, negative = green)
  const isPositive = profit.greaterThanOrEqualTo(0);
  const textColor = isPositive ? "text-[#ec4899]" : "text-[#10b981]";

  return (
    <div className="flex flex-col text-xs tabular-nums">
      <div className="flex items-center">
        <span>
          $ {formatCurrency(earning)}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1 mb-1 pl-2">
        <span className={`${textColor}`}>
          {isPositive ? "↑" : "↓"}
        </span>
        <span className={`${textColor}`}>
          {isPositive ? "+" : "-"}{profitRate.toFixed(2)}%
        </span>
      </div>
      <div className="pl-2">
        <span className={`${textColor}`}>
          $ {formatCurrency(profit.toNumber())}
        </span>
      </div>
    </div>
  );
};
