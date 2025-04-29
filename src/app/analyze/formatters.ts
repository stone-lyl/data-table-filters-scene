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
    return `${sign}$${decimalValue.dividedBy(1000000).toFixed(2)}M`;
  } else if (decimalValue.greaterThanOrEqualTo(1000)) {
    return `${sign}$${decimalValue.dividedBy(1000).toFixed(2)}k`;
  } else {
    return `${sign}$${decimalValue.toFixed(2)}`;
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
