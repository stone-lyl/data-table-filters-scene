import { format } from "date-fns";

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(ms / 1000) + "s"
    );
  }

  return (
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(ms) +
    "ms"
  );
}

export function formatMilliseconds(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(
    value
  );
}

export function formatDate(value: Date | string) {
  return format(new Date(`${value}`), "LLL dd, y HH:mm");
}

export function formatCompactNumber(value: number) {
  if (value >= 100 && value < 1000) {
    return value.toString(); // Keep the number as is if it's in the hundreds
  } else if (value >= 1000 && value < 1000000) {
    return (value / 1000).toFixed(1) + "k"; // Convert to 'k' for thousands
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M"; // Convert to 'M' for millions
  } else {
    return value.toString(); // Optionally handle numbers less than 100 if needed
  }
}
import Decimal from "decimal.js-light";

/**
 * Format a currency value with k/M suffix for large numbers
 * @param value The number to format
 * @returns Formatted currency string (e.g. $1.25k, $1.25M)
 */
export const formatCurrency = (value: number): string => {
  const decimalValue = new Decimal(Math.abs(value));
  const sign = value < 0 ? '-' : '';
  
  if (decimalValue.greaterThanOrEqualTo(1000000)) {
    return `${sign}${decimalValue.dividedBy(1000000).toFixed(2)}M`;
  } else if (decimalValue.greaterThanOrEqualTo(1000)) {
    return `${sign}${decimalValue.dividedBy(1000).toFixed(2)}k`;
  } else {
    return `${sign}${decimalValue.toFixed(2)}`;
  }
};

/**
 * Format a Bitcoin amount with 4 decimal places
 * @param value The Bitcoin amount as a string
 * @returns Formatted Bitcoin string with 4 decimal places
 */
export const formatBtcAmount = (value: string): string => {
  const btcAmount = new Decimal(value);
  return btcAmount.toFixed(4);
};

/**
 * Format a big number for display with improved readability
 * @param value The big number as a string
 * @returns Formatted string representation of the big number
 */
export const formatBigNumber = (value: string): string => {
  try {
    const bigNum = new Decimal(value);
    
    // For extremely large numbers (over 10^15), use scientific notation
    if (bigNum.greaterThanOrEqualTo('1e15')) {
      return bigNum.toExponential(2);
    }
    
    // For large numbers, add thousand separators
    // Convert to string and add commas every 3 digits from the right
    const numStr = bigNum.toString();
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } catch (error) {
    // If parsing fails, return the original string
    return value;
  }
};
