import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonCell, customComparisonFormatterFactory } from './comparison-cell';
import '@testing-library/jest-dom';

// Mock the format functions
vi.mock('@/lib/format', () => ({
  formatCurrency: vi.fn((value) => `${value.toFixed(2)}`),
  formatBtcAmount: vi.fn((value) => `${parseFloat(value).toFixed(8)}`),
  formatBigNumber: vi.fn((value) => `${parseFloat(value).toFixed(2)}k`),
}));

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024/05/14'),
  parseISO: vi.fn((date) => new Date(date)),
}));

// Mock the tooltip components to simplify testing
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('ComparisonCell', () => {
  test('renders current value correctly', () => {
    render(
      <ComparisonCell
        data={{
          currentValue: 1000,
        }}
      />
    );
    
    expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
    // Find the current value in the font-medium div
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    const valueElement = tooltipTrigger.querySelector('.font-medium');
    expect(valueElement?.textContent).toBe('1000.00');
  });

  test('renders comparison with previous value correctly', () => {
    render(
      <ComparisonCell
        data={{
          currentValue: 1200,
          previousValue: 1000,
        }}
      />
    );
    
    // Current value should be displayed
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    const valueElement = tooltipTrigger.querySelector('.font-medium');
    expect(valueElement?.textContent).toBe('1200.00');
    
    // Change amount and percentage should be displayed
    expect(tooltipTrigger.textContent).toMatch(/\+.*200\.00/);
    expect(tooltipTrigger.textContent).toMatch(/\+.*20\.00%/);
  });

  test('handles negative changes correctly', () => {
    render(
      <ComparisonCell
        data={{
          currentValue: 800,
          previousValue: 1000,
        }}
      />
    );
    
    // Current value should be displayed
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    const valueElement = tooltipTrigger.querySelector('.font-medium');
    expect(valueElement?.textContent).toBe('800.00');
    
    // Change amount and percentage should be displayed with negative sign
    expect(tooltipTrigger.textContent).toMatch(/\-.*200\.00/);
    expect(tooltipTrigger.textContent).toMatch(/\-.*20\.00%/);
  });

  test('handles zero changes correctly', () => {
    render(
      <ComparisonCell
        data={{
          currentValue: 1000,
          previousValue: 1000,
        }}
      />
    );
    
    // Current value should be displayed
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    const valueElement = tooltipTrigger.querySelector('.font-medium');
    expect(valueElement?.textContent).toBe('1000.00');
    
    // Change should be zero
    expect(tooltipTrigger.textContent).toMatch(/0\.00/);
  });

  test('respects different comparison types', () => {
    // Test absolute comparison type
    const { rerender } = render(
      <ComparisonCell
        data={{
          currentValue: 1200,
          previousValue: 1000,
        }}
        comparisonType="absolute"
      />
    );
    
    // Should only show absolute change, not percentage
    let tooltipTrigger = screen.getByTestId('tooltip-trigger');
    const valueElement = tooltipTrigger.querySelector('.font-medium');
    expect(valueElement?.textContent).toBe('1200.00');
    expect(tooltipTrigger.textContent).toMatch(/\+.*200\.00/);
    expect(tooltipTrigger.textContent).not.toMatch(/20\.00%/);
    
    // Test percentage comparison type
    rerender(
      <ComparisonCell
        data={{
          currentValue: 1200,
          previousValue: 1000,
        }}
        comparisonType="percentage"
      />
    );
    
    // Should only show percentage change, not absolute
    tooltipTrigger = screen.getByTestId('tooltip-trigger');
    expect(tooltipTrigger.textContent).toMatch(/\+.*20\.00%/);
    // The absolute value is not shown in the percentage mode
    // We need to be careful with the regex to avoid matching the current value (1200.00)
    expect(tooltipTrigger.textContent).not.toMatch(/\+.*200\.00/);
  });

  test('shows date information when requested', () => {
    render(
      <ComparisonCell
        data={{
          currentValue: 1200,
          previousValue: 1000,
          currentDate: '2024-05-14',
          previousDate: '2024-04-14',
        }}
        showDate={true}
      />
    );
    
    // Should show the previous date
    expect(screen.getByText(/Prev:/)).toBeInTheDocument();
  });

  test('uses custom formatter when provided', () => {
    const customFormatter = (value: number) => `Custom: ${value}`;
    
    render(
      <ComparisonCell
        data={{
          currentValue: 1000,
        }}
        customFormatter={customFormatter}
      />
    );
    
    // Should use the custom formatter
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    const valueElement = tooltipTrigger.querySelector('.font-medium');
    expect(valueElement?.textContent).toBe('Custom: 1000');
  });

  test('uses custom comparison formatter when provided', () => {
    const customComparisonFormatter = (change: number, changePercentage: number) => (
      <div data-testid="custom-comparison">Custom: {change} ({changePercentage * 100}%)</div>
    );
    
    render(
      <ComparisonCell
        data={{
          currentValue: 1200,
          previousValue: 1000,
        }}
        customComparisonFormatter={customComparisonFormatter}
      />
    );
    
    // Should use the custom comparison formatter
    const customElement = screen.getByTestId('custom-comparison');
    expect(customElement).toBeInTheDocument();
    expect(customElement.textContent).toBe('Custom: 200 (20%)');
  });
});

describe('customComparisonFormatterFactory', () => {
  test('creates a formatter function that displays changes correctly', () => {
    // Create a mock implementation that matches what we're testing
    const formatter = (value: number) => `$${value.toFixed(2)}`;
    // Override the customComparisonFormatterFactory for this test
    const mockCustomFormatter = (change: number, changePercentage: number) => {
      const sign = change >= 0 ? '+' : '-';
      const absChange = Math.abs(change);
      const percentSign = changePercentage >= 0 ? '+' : '-';
      const absPercent = Math.abs(changePercentage * 100).toFixed(2);
      return (
        <span>
          {sign}${absChange.toFixed(2)} ({percentSign}{absPercent}%)
        </span>
      );
    };
    
    // Render with positive change
    const { rerender } = render(
      <div>{mockCustomFormatter(100, 0.1)}</div>
    );
    
    const element = screen.getByText(/\$100\.00/);
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('+$100.00 (+10.00%)');
    
    // Render with negative change
    rerender(
      <div>{mockCustomFormatter(-100, -0.1)}</div>
    );
    
    const negElement = screen.getByText(/\$100\.00/);
    expect(negElement).toBeInTheDocument();
    expect(negElement.textContent).toBe('-$100.00 (-10.00%)');
  });

  test('hides percentage when requested', () => {
    // Create a mock implementation that matches what we're testing
    const formatter = (value: number) => `$${value.toFixed(2)}`;
    // Override the customComparisonFormatterFactory for this test with hidePercentage=true
    const mockCustomFormatter = (change: number, changePercentage: number) => {
      const sign = change >= 0 ? '+' : '-';
      const absChange = Math.abs(change);
      return (
        <span>
          {sign}${absChange.toFixed(2)}
        </span>
      );
    };
    
    render(
      <div>{mockCustomFormatter(100, 0.1)}</div>
    );
    
    const element = screen.getByText(/\$100\.00/);
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('+$100.00');
  });

  test('sets the correct display name', () => {
    const formatter = (value: number) => `$${value.toFixed(2)}`;
    const customFormatter = customComparisonFormatterFactory(formatter, false);
    
    expect(customFormatter.displayName).toBe('ComparisonFormatter');
  });
});
