import { describe, test, expect, vi } from 'vitest';
import { 
  createFormatter, 
  currencyHandler, 
  percentageHandler, 
  dateHandler, 
  defaultHandler,
  DefaultDecimal
} from './create-formatter';

// Mock the format functions
vi.mock('@/lib/format', () => ({
  formatCurrency: vi.fn((value) => `${value.toFixed(2)}`),
  formatBtcAmount: vi.fn((value) => `${parseFloat(value).toFixed(8)}`),
  formatBigNumber: vi.fn((value) => `${parseFloat(value).toFixed(2)}k`),
}));

vi.mock('date-fns', () => ({
  format: vi.fn((date) => {
    // Check if date is invalid
    if (date instanceof Date && isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return '2024/05/14';
  }),
  parseISO: vi.fn((date) => {
    // Return Invalid Date for 'not-a-date' string to simulate invalid date behavior
    if (date === 'not-a-date') {
      return new Date('invalid-date');
    }
    return new Date(date);
  }),
}));

describe('createFormatter', () => {
  test('should create a formatter function', () => {
    const formatter = createFormatter({ format: { type: 'currency' } });
    expect(typeof formatter).toBe('function');
  });

  test('should return empty string for null or undefined values', () => {
    const formatter = createFormatter({ format: { type: 'currency' } });
    expect(formatter(null)).toBe('');
    expect(formatter(undefined)).toBe('');
  });

  test('should format currency values correctly', () => {
    const formatter = createFormatter({ format: { type: 'currency' } });
    expect(formatter(1000)).toBe('1000.00'); // Using our mocked formatCurrency
    
    const formatterWithUnit = createFormatter({ format: { type: 'currency', unit: '$' } });
    expect(formatterWithUnit(1000)).toBe('1000.00 $');
  });

  test('should format BTC values correctly', () => {
    const formatter = createFormatter({ format: { type: 'currency', unit: 'BTC' } });
    expect(formatter(1.23456789)).toBe('1.23456789 BTC');
  });

  test('should format percentage values correctly', () => {
    const formatter = createFormatter({ format: { type: 'percentage' } });
    expect(formatter(0.1234)).toBe(`12.34%`);
    expect(formatter(1)).toBe(`100.00%`);
  });

  test('should format date values correctly', () => {
    const formatter = createFormatter({ format: { type: 'time' } });
    const date = new Date('2024-05-14');
    expect(formatter(date)).toBe('2024/05/14');
    expect(formatter('2024-05-14')).toBe('2024/05/14');
  });

  test('should use default handler for unknown format types', () => {
    const formatter = createFormatter({ format: { type: 'unknown' } });
    expect(formatter(1000)).toBe('1000.00k');
  });
});

describe('formatter handlers', () => {
  test('currencyHandler should format currency values', () => {
    const ctx = { 
      value: 1000, 
      format: { type: 'currency' } 
    };
    expect(currencyHandler(ctx, defaultHandler)).toBe('1000.00');
    
    const ctxWithUnit = { 
      value: 1000, 
      format: { type: 'currency', unit: '€' } 
    };
    expect(currencyHandler(ctxWithUnit, defaultHandler)).toBe('1000.00 €');
  });

  test('percentageHandler should format percentage values', () => {
    const ctx = { 
      value: 0.5, 
      format: { type: 'percentage' } 
    };
    expect(percentageHandler(ctx, defaultHandler)).toBe(`50.00%`);
  });

  test('dateHandler should format date values', () => {
    const ctx = { 
      value: '2024-05-14', 
      format: { type: 'time' } 
    };
    // Our mock implementation returns 2024/05/14 for valid dates
    expect(dateHandler(ctx, defaultHandler)).toBe('2024/05/14');
    
    // Should handle invalid dates gracefully
    const invalidCtx = { 
      value: 'not-a-date', 
      format: { type: 'time' } 
    };
    // Our mock implementation returns the original value for invalid dates
    expect(dateHandler(invalidCtx, defaultHandler)).toBe('not-a-date');
  });

  test('defaultHandler should format numbers as big numbers', () => {
    const ctx = { 
      value: 1000000, 
      format: { type: 'unknown' } 
    };
    expect(defaultHandler(ctx, () => '')).toBe('1000000.00k');
  });
});
