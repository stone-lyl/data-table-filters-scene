"use client";

import React from "react";
import Decimal from "decimal.js-light";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createFormatter, FormatterFn } from "../nonce/utils/create-formatter";

export type FormatType = "currency" | "percentage" | "number" | "custom";

export interface FormatInfo {
  type: FormatType;
  unit: string | null;
}
export type ComparisonType = "absolute" | "percentage" | "both";

interface ComparisonCellProps {
  data: {
    currentValue: number;
    previousValue?: number;
    currentDate?: string;
    previousDate?: string;
  }
  formatInfo?: FormatInfo;
  comparisonType?: ComparisonType;
  decimals?: number;
  showDate?: boolean;
  customFormatter?: (value: number) => string;
  customComparisonFormatter?: (change: number, changePercentage: number) => React.ReactNode;
  tooltipClassName?: string;
}

const DefaultDecimal = 2;
  
/**
 * A flexible comparison cell component for displaying current values with comparison to previous values
 */
const ComparisonCellBase: React.FC<ComparisonCellProps> = ({
  data,
  formatInfo = { type: "currency", unit: null },
  comparisonType = "both",
  showDate = false,
  customFormatter,
  customComparisonFormatter,
  tooltipClassName,
}) => {
  const { currentValue, previousValue, currentDate, previousDate } = data;
  // Convert values to Decimal for precise calculations
  const current = new Decimal(currentValue);
  const previous = previousValue !== undefined ? new Decimal(previousValue) : null;
  const dateFormatter = createFormatter({
    format: { type: 'time' },
  });
  const percentageFormatter = createFormatter({
    format: { type: 'percentage' },
  });
  const valueFormatter = createFormatter({
    format: {
      type: formatInfo.type,
      unit: formatInfo.unit || undefined,
    },
  });
  
  // Calculate change and change percentage
  const change = previous ? current.minus(previous) : null;
  const changePercentage = previous && !previous.isZero() 
    ? change!.dividedBy(previous)
    : new Decimal(0);
  
  // Determine if the change is positive, negative, or neutral
  const isPositive = change ? change.greaterThan(0) : false;
  const isNeutral = change ? change.isZero() : true;
  
  const textColor = isNeutral
    ? `text-neutral`
    : isPositive
      ? `text-positive`
      : `text-negative`;

  // Format the current value based on the format info
  const formatValue = (value: Decimal): string => {
    if (customFormatter) {
      return customFormatter(value.toNumber());
    }
    
    return valueFormatter(value.toNumber());
  };

  // Format the change value
  const formatChange = (value: Decimal): string => {
    return valueFormatter(value.toNumber());
  };

  // Format the change percentage
  const formatChangePercentage = (value: Decimal): string => {
    return percentageFormatter(value.toNumber());
  };

  const formatChangePercentageStr = formatChangePercentage(changePercentage!.abs());
  // Get the appropriate arrow symbol
  const getArrow = () => {
    return isPositive ? "↑" : isNeutral ? "→" : "↓";
  };

  // Get the sign for the change value
  const getSign = () => {
    return isPositive ? "+" : isNeutral ? "" : "-";
  };

  // Render the comparison section
  const renderComparison = () => {
    if (!change || !previous) return null;
    
    if (customComparisonFormatter) {
      return customComparisonFormatter(change.toNumber(), changePercentage ? changePercentage.toNumber() : 0);
    }

    switch (comparisonType) {
      case "absolute":
        return (
          <div className={`flex items-center gap-1 ${textColor}`}>
            {getArrow()} {getSign()}{formatChange(change.abs())}
          </div>
        );
      case "percentage":
        return (
          <div className={`flex items-center gap-1  ${textColor}`}>
            {getArrow()} {getSign()}{formatChangePercentageStr}
          </div>
        );
      case "both":
      default:
        return (
          <>
            <div className={`flex items-center gap-1 ${textColor}`}>
              {getArrow()} {getSign()}{formatChange(change.abs())}
            </div>
            <div className={`flex items-center gap-1 ${textColor}`}>
              {getSign()}{formatChangePercentageStr}
            </div>
          </>
        );
    }
  };

  // Render date information if requested
  const renderDates = () => {
    if (!showDate || !previousDate) return null;
    
    return (
      <div className="text-xs text-gray-500 mt-1">
        {previousDate && <div>Prev: {dateFormatter(previousDate)}</div>}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex flex-col text-xs tabular-nums text-end", tooltipClassName)}>
            <div className="font-medium">
              {formatValue(current)}
            </div>
            
            {change && (
              <div className="mt-1 space-y-0.5 text-end">
                {renderComparison()}
              </div>
            )}
            
            {renderDates()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-md">
          <div className="space-y-2 text-sm">
            {previous && (
              <div className="flex justify-between">
                <span className="font-medium">Previous:</span>
                <span>{formatValue(previous)}</span>
              </div>
            )}
            {change && (
              <div className="flex justify-between">
                <span className="font-medium">Change:</span>
                <span className={textColor}>
                  {isPositive ? "+" : "-"}{formatValue(change.abs())}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Current:</span>
              <span>{formatValue(current)}</span>
            </div>
            {changePercentage && (
              <div className="flex justify-between">
                <span className="font-medium">% Change:</span>
                <span className={textColor}>
                  {isPositive ? "+" : "-"}{formatChangePercentageStr}
                </span>
              </div>
            )}
            {currentDate && (
              <div className="flex justify-between">
                <span className="font-medium">Current Date:</span>
                <span>{dateFormatter(currentDate)}</span>
              </div>
            )}
            {previousDate && (
              <div className="flex justify-between">
                <span className="font-medium">Previous Date:</span>
                <span>{dateFormatter(previousDate)}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Memoized version of the ComparisonCell component to prevent unnecessary re-renders
 */
export const ComparisonCell = React.memo(ComparisonCellBase);

/**
 * A specialized comparison cell for comparing current and previous period amounts
 */
export interface ComparisonInfo {
  currentValue: number;
  previousValue?: number;
  currentDate?: string;
  previousDate?: string;
}

export function customComparisonFormatterFactory(formatter: FormatterFn, hidePercentage: boolean) {
  return (change: number, changePercentage: number) => (
    <div className="space-y-1">
      <div>
        <span className={change > 0 ? "text-positive" : "text-negative"}>
          {change > 0 ? "+" : "-"}{formatter(Math.abs(change))}
        </span>
        {!hidePercentage && (
          <span className={changePercentage > 0 ? "text-positive" : "text-negative"}>  
            ({changePercentage > 0 ? "+" : "-"}{Math.abs(changePercentage).toFixed(DefaultDecimal)}%)
          </span>
        )}
      </div>
    </div>
  );
}
