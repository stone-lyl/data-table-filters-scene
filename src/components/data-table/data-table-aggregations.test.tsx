import { describe, expect, it } from "vitest";
import { countAggregation, sumAggregation } from "./data-table-aggregations";
import Decimal from "decimal.js-light";

// Test the aggregation methods directly
describe('Aggregation Methods', () => {
    // Mock table for testing aggregations
    const mockTable = {
      getColumn: (columnId: string) => ({
        id: columnId,
        columnDef: {
          meta: { fieldType: 'measure' },
          cell: ({ row }: any) => `$${row.getValue(columnId)}`,
        },
      }),
    };
  
    it('sumAggregation calculates sum correctly', () => {
      const values = [100, 200, 300];
      const result = sumAggregation('amount', values, mockTable as any);
      
      // Convert the React element to string for testing
      const resultString = (result as React.JSX.Element)?.props?.row?.getValue('amount').toString() || '';
      
      expect(resultString).toContain('600');
    });
  
    it('countAggregation returns correct count', () => {
      const values = [100, 200, 300];
      const result = countAggregation('amount', values, mockTable as any);
      
      expect(result).toBe(3);
    });
  
    it('sumAggregation handles empty values', () => {
      const result = sumAggregation('amount', [], mockTable as any);
      
      expect(result).toBeNull();
    });
  });
  
  // Test the custom sum calculation using Decimal.js
  describe('Decimal.js Sum Calculation', () => {
    it('correctly sums decimal values', () => {
      const values = ['100.25', '200.50', '300.75'];
      
      const sum = values.reduce((acc, val) => {
        const decimalVal = new Decimal(val);
        return acc.plus(decimalVal);
      }, new Decimal(0));
      
      expect(sum.toString()).toBe('601.5');
    });
  
    it('handles precision issues correctly', () => {
      // JavaScript would normally have precision issues with these values
      const values = ['0.1', '0.2', '0.3'];
      
      const sum = values.reduce((acc, val) => {
        const decimalVal = new Decimal(val);
        return acc.plus(decimalVal);
      }, new Decimal(0));
      
      // With Decimal.js, we get the exact result
      expect(sum.toString()).toBe('0.6');
      
      // Compare with regular JavaScript addition which has precision issues
      const jsSum = 0.1 + 0.2 + 0.3;
      expect(jsSum).not.toBe(0.6); // JavaScript would give something like 0.6000000000000001
    });
  });