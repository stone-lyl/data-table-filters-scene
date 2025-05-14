import { describe, it, expect } from 'vitest';
import { customSumAggregation } from './decimal-aggregation';
import Decimal from 'decimal.js-light';

describe('decimal-aggregation', () => {
  describe('customSumAggregation', () => {
    const columnId = 'amount';
    
    it('should return null for empty array', () => {
      const result = customSumAggregation(columnId, []);
      expect(result).toBeNull();
    });
    
    it('should correctly sum integer values', () => {
      const rows = [
        { getValue: (id: string) => id === columnId ? 10 : null },
        { getValue: (id: string) => id === columnId ? 20 : null },
        { getValue: (id: string) => id === columnId ? 30 : null }
      ];
      
      const result = customSumAggregation(columnId, rows as any);
      expect(result).toBe('60');
    });
    
    it('should correctly sum decimal values', () => {
      const rows = [
        { getValue: (id: string) => id === columnId ? 10.5 : null },
        { getValue: (id: string) => id === columnId ? 20.25 : null },
        { getValue: (id: string) => id === columnId ? 30.75 : null }
      ];
      
      const result = customSumAggregation(columnId, rows as any);
      expect(result).toBe('61.5');
    });
    
    it('should correctly sum string number values', () => {
      const rows = [
        { getValue: (id: string) => id === columnId ? '10.5' : null },
        { getValue: (id: string) => id === columnId ? '20.25' : null },
        { getValue: (id: string) => id === columnId ? '30.75' : null }
      ];
      
      const result = customSumAggregation(columnId, rows as any);
      expect(result).toBe('61.5');
    });
    
    it('should handle large numbers without precision loss', () => {
      const rows = [
        { getValue: (id: string) => id === columnId ? '9999999999999999.99' : null },
        { getValue: (id: string) => id === columnId ? '0.01' : null }
      ];
      
      const result = customSumAggregation(columnId, rows as any);
      expect(result).toBe('10000000000000000');
      
      // Demonstrate that Decimal.js handles precision better than native JS
      const decimalSum = new Decimal('9999999999999999.99').plus(new Decimal('0.01')).toString();
      expect(decimalSum).toBe('10000000000000000');
    });
    
    it('should handle negative numbers correctly', () => {
      const rows = [
        { getValue: (id: string) => id === columnId ? 100 : null },
        { getValue: (id: string) => id === columnId ? -50 : null },
        { getValue: (id: string) => id === columnId ? -25 : null }
      ];
      
      const result = customSumAggregation(columnId, rows as any);
      expect(result).toBe('25');
    });
  });
});
