"use client";
import { formatCurrency } from "./formatters";

// Profit display component
export const ProfitDisplay = ({ earning, cost }: { earning: number; cost: number; }) => {
  // Calculate profit and profit rate
  const profit = earning - cost;
  const profitRate = cost !== 0 ? (profit / cost) * 100 : 0;

  // Determine color based on profit (positive = red, negative = green)
  const isPositive = profit >= 0;
  const textColor = isPositive ? "text-[#ec4899]" : "text-[#10b981]";

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="font-mono font-medium">
          {formatCurrency(earning)}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1 mb-1 pl-4">
        <span className={`text-xs ${textColor}`}>
          {isPositive ? "↑" : "↓"}
        </span>
        <span className={`text-xs ${textColor}`}>
          {isPositive ? "+" : ""}{profitRate.toFixed(2)}%
        </span>
      </div>
      <div className="pl-4">
        <span className={`text-xs pr-1 ${textColor}`}>
          {formatCurrency(profit)}
        </span>
      </div>
    </div>
  );
};
