import { describe, it, expect } from 'vitest';
import { decimalSortingFn } from './sorting';

describe('sorting', () => {
  describe('decimalSortingFn', () => {
    const columnId = 'amount';
    
    it('should return 0 when values are equal', () => {
      const rowA = { getValue: (id: string) => id === columnId ? 10 : null };
      const rowB = { getValue: (id: string) => id === columnId ? 10 : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(0);
    });
    
    it('should return -1 when first value is less than second', () => {
      const rowA = { getValue: (id: string) => id === columnId ? 10 : null };
      const rowB = { getValue: (id: string) => id === columnId ? 20 : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(-1);
    });
    
    it('should return 1 when first value is greater than second', () => {
      const rowA = { getValue: (id: string) => id === columnId ? 30 : null };
      const rowB = { getValue: (id: string) => id === columnId ? 20 : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(1);
    });
    
    it('should handle decimal values correctly', () => {
      const rowA = { getValue: (id: string) => id === columnId ? 10.5 : null };
      const rowB = { getValue: (id: string) => id === columnId ? 10.2 : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(1);
    });
    
    it('should handle string number values', () => {
      const rowA = { getValue: (id: string) => id === columnId ? '10.5' : null };
      const rowB = { getValue: (id: string) => id === columnId ? '20.25' : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(-1);
    });
    
    it('should handle large numbers without precision loss', () => {
      const rowA = { getValue: (id: string) => id === columnId ? '9999999999999999.99' : null };
      const rowB = { getValue: (id: string) => id === columnId ? '9999999999999999.98' : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(1);
      
      // Verify that regular JS comparison would have precision issues
      const jsCompare = 9999999999999999.99 > 9999999999999999.98;
      expect(jsCompare).toBe(false); // JS would incorrectly say they're equal due to precision limits
    });
    
    it('should handle negative numbers correctly', () => {
      const rowA = { getValue: (id: string) => id === columnId ? -50 : null };
      const rowB = { getValue: (id: string) => id === columnId ? -25 : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(-1);
    });
    
    it('should return 0 when values are undefined', () => {
      const rowA = { getValue: (id: string) => id === columnId ? undefined : null };
      const rowB = { getValue: (id: string) => id === columnId ? undefined : null };
      
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(result).toBe(0);
    });
    
    it('should fall back to JS comparison if decimal conversion fails', () => {
      const rowA = { getValue: (id: string) => id === columnId ? 'not a number' : null };
      const rowB = { getValue: (id: string) => id === columnId ? 'also not a number' : null };
      
      // This should not throw an error
      const result = decimalSortingFn(rowA as any, rowB as any, columnId);
      expect(typeof result).toBe('number');
    });
  });
});
