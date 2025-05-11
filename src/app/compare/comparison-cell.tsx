"use client";

import React from "react";
import Decimal from "decimal.js-light";
import { formatCurrency, formatBigNumber } from "../analyze/util/formatters";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FormatterFn } from "../nonce/utils/create-formatter";

export type FormatType = "currency" | "percentage" | "number" | "custom";
export type ComparisonType = "absolute" | "percentage" | "both";

interface ComparisonCellProps {
  currentValue: number;
  previousValue?: number;
  formatType?: FormatType;
  comparisonType?: ComparisonType;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  showArrows?: boolean;
  positiveColor?: string;
  negativeColor?: string;
  neutralColor?: string;
  showDate?: boolean;
  currentDate?: string;
  previousDate?: string;
  customFormatter?: (value: number) => string;
  customComparisonFormatter?: (change: number, changePercentage: number) => React.ReactNode;
  className?: string;
}

/**
 * A flexible comparison cell component for displaying current values with comparison to previous values
 */
export const ComparisonCell: React.FC<ComparisonCellProps> = ({
  currentValue,
  previousValue,
  formatType = "currency",
  comparisonType = "both",
  prefix = "",
  decimals = 2,
  showArrows = true,
  positiveColor = "text-[#ec4899]", // Pink
  negativeColor = "text-[#10b981]", // Green
  neutralColor = "text-gray-500",
  showDate = false,
  currentDate,
  previousDate,
  customFormatter,
  customComparisonFormatter,
  className,
}) => {
  // Convert values to Decimal for precise calculations
  const current = new Decimal(currentValue);
  const previous = previousValue !== undefined ? new Decimal(previousValue) : null;
  
  // Calculate change and change percentage
  const change = previous ? current.minus(previous) : null;
  const changePercentage = previous && !previous.isZero() 
    ? change!.dividedBy(previous).times(100) 
    : null;
  
  // Determine if the change is positive, negative, or neutral
  const isPositive = change ? change.greaterThan(0) : false;
  const isNeutral = change ? change.isZero() : true;
  
  // Set color based on change direction
  const textColor = isNeutral 
    ? neutralColor 
    : isPositive 
      ? positiveColor 
      : negativeColor;

  // Format the current value based on the format type
  const formatValue = (value: Decimal): string => {
    if (customFormatter) {
      return customFormatter(value.toNumber());
    }
    
    switch (formatType) {
      case "currency":
        return formatCurrency(value.toNumber());
      case "percentage":
        return `${value.toFixed(decimals)}%`;
      case "number":
      default:
        return value.toFixed(decimals);
    }
  };

  // Format the change value
  const formatChange = (value: Decimal): string => {
    if (formatType === "currency") {
      return formatCurrency(value.toNumber());
    }
    return value.toFixed(decimals);
  };

  // Format the change percentage
  const formatChangePercentage = (value: Decimal): string => {
    return `${value.toFixed(decimals)}%`;
  };

  // Get the appropriate arrow symbol
  const getArrow = () => {
    if (!showArrows) return null;
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
          <div className={`flex items-center gap-1 ${textColor}`}>
            {getArrow()} {getSign()}{formatChangePercentage(changePercentage!.abs())}
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
              {getSign()}{formatChangePercentage(changePercentage!.abs())}
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
        {previousDate && <div>Prev: {format(new Date(previousDate), "yyyy/MM/dd")}</div>}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex flex-col text-xs tabular-nums", className)}>
            <div className="font-medium">
              {prefix}{formatValue(current)}
            </div>
            
            {change && (
              <div className="pl-2 mt-1 space-y-0.5">
                {renderComparison()}
              </div>
            )}
            
            {renderDates()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-md">
          <div className="space-y-2">

            {previous && (
              <div className="flex justify-between">
                <span className="font-medium">Previous:</span>
                <span>{prefix}{formatBigNumber(previous.toFixed(decimals).toString())}</span>
              </div>
            )}
            {change && (
              <div className="flex justify-between">
                <span className="font-medium">Change:</span>
                <span className={textColor}>
                  {isPositive ? "+" : "-"}{prefix}{formatBigNumber(change.abs().toFixed(decimals).toString())}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Current:</span>
              <span>{prefix}{formatBigNumber(current.toFixed(decimals).toString())}</span>
            </div>
            {changePercentage && (
              <div className="flex justify-between">
                <span className="font-medium">% Change:</span>
                <span className={textColor}>
                  {isPositive ? "+" : "-"}{formatBigNumber(changePercentage.abs().toFixed(decimals).toString())}%
                </span>
              </div>
            )}
            {currentDate && (
              <div className="flex justify-between">
                <span className="font-medium">Current Date:</span>
                <span>{format(new Date(currentDate), "yyyy/MM/dd")}</span>
              </div>
            )}
            {previousDate && (
              <div className="flex justify-between">
                <span className="font-medium">Previous Date:</span>
                <span>{format(new Date(previousDate), "yyyy/MM/dd")}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * A specialized comparison cell for comparing current and previous period amounts
 */
export const AmountComparisonCell: React.FC<{
  currentAmount: number;
  previousAmount?: number;
  currentDate?: string;
  previousDate?: string;
  showDate?: boolean;
  className?: string;
  showTooltip?: boolean;
  hidePercentage?: boolean;
  formatter?: FormatterFn;
}> = ({
  currentAmount,
  previousAmount,
  currentDate,
  previousDate,
  showDate = false,
  className,
  showTooltip = true,
  hidePercentage = false,
  formatter = formatCurrency,
}) => {
  
  // Create a custom comparison formatter that shows the period label if provided
  const customComparisonFormatter = (change: number, changePercentage: number) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={change > 0 ? "text-[#ec4899]" : "text-[#10b981]"}>
            {change > 0 ? "+" : "-"}${formatter(Math.abs(change))}
          </span>
          {!hidePercentage && (
            <span className={changePercentage > 0 ? "text-[#ec4899]" : "text-[#10b981]"}>  
              ({changePercentage > 0 ? "+" : "-"}{Math.abs(changePercentage).toFixed(2)}%)
            </span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <ComparisonCell
      currentValue={currentAmount}
      previousValue={previousAmount}
      formatType="custom"
      customFormatter={formatter}
      comparisonType="both"
      prefix="$"
      showArrows={true}
      showDate={showDate}
      currentDate={currentDate}
      previousDate={previousDate}
      className={className}
      customComparisonFormatter={customComparisonFormatter}
    />
  );
};
