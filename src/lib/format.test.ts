import { describe, expect, test } from 'vitest';
import { formatCurrency, formatBtcAmount, formatBigNumber } from './format';

describe('formatCurrency', () => {
  test('formats numbers less than 1000', () => {
    expect(formatCurrency(0)).toBe('0.00');
    expect(formatCurrency(1)).toBe('1.00');
    expect(formatCurrency(123.45)).toBe('123.45');
    expect(formatCurrency(999.99)).toBe('999.99');
  });

  test('formats numbers between 1000 and 999999', () => {
    expect(formatCurrency(1000)).toBe('1.00k');
    expect(formatCurrency(1500)).toBe('1.50k');
    expect(formatCurrency(12345)).toBe('12.35k');
    expect(formatCurrency(999999)).toBe('1000.00k');
  });

  test('formats numbers 1000000 and above', () => {
    expect(formatCurrency(1000000)).toBe('1.00M');
    expect(formatCurrency(1500000)).toBe('1.50M');
    expect(formatCurrency(12345678)).toBe('12.35M');
    expect(formatCurrency(9876543210)).toBe('9876.54M');
  });

  test('handles negative numbers correctly', () => {
    expect(formatCurrency(-123.45)).toBe('-123.45');
    expect(formatCurrency(-1500)).toBe('-1.50k');
    expect(formatCurrency(-1500000)).toBe('-1.50M');
  });
});

describe('formatBtcAmount', () => {
  test('formats BTC amount with 4 decimal places', () => {
    expect(formatBtcAmount('0')).toBe('0.0000');
    expect(formatBtcAmount('0.5')).toBe('0.5000');
    expect(formatBtcAmount('1.23')).toBe('1.2300');
    expect(formatBtcAmount('0.12345')).toBe('0.1235'); // Rounds to 4 decimal places
    expect(formatBtcAmount('1.23456789')).toBe('1.2346'); // Rounds to 4 decimal places
  });

  test('handles string representations of numbers', () => {
    expect(formatBtcAmount('1')).toBe('1.0000');
    expect(formatBtcAmount('0.0001')).toBe('0.0001');
    expect(formatBtcAmount('10.0')).toBe('10.0000');
  });
});

describe('formatBigNumber', () => {
  test('adds commas as thousand separators for regular numbers', () => {
    expect(formatBigNumber('1000')).toBe('1,000');
    expect(formatBigNumber('1000000')).toBe('1,000,000');
    expect(formatBigNumber('1234567890')).toBe('1,234,567,890');
  });

  test('uses scientific notation for extremely large numbers', () => {
    expect(formatBigNumber('1000000000000000')).toBe('1.00e+15');
    expect(formatBigNumber('1234500000000000000')).toBe('1.23e+18');
  });

  test('handles decimal numbers', () => {
    expect(formatBigNumber('1234.56')).toBe('1,234.56');
    expect(formatBigNumber('1234567.89')).toBe('1,234,567.89');
  });

  test('returns original string if parsing fails', () => {
    expect(formatBigNumber('invalid')).toBe('invalid');
    expect(formatBigNumber('123abc')).toBe('123abc');
  });
});
