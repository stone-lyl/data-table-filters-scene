import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTransformedData, useTransform } from './use-transformed-data';
import { transformData } from './transform-data';

// Mock the transformData function
vi.mock('./transform-data', () => ({
  transformData: vi.fn(),
}));

// Mock the SWR hook
vi.mock('swr', () => ({
  default: vi.fn((_key, fetcher) => {
    if (!_key) {
      return { data: null, error: null, isValidating: false };
    }
    return {
      data: [{ id: 1, value: 100 }],
      error: null,
      isValidating: false,
    };
  }),
}));

describe('useTransformedData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return empty data when not ready to fetch', () => {
    const { result } = renderHook(() => 
      useTransformedData({
        datasets: {
          primary: { data: [], columns: [], isLoading: true },
          comparison: { data: [], columns: [], isLoading: false },
        },
        joinQuery: 'SELECT * FROM primaryData',
      })
    );

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should return data when ready to fetch', () => {
    const { result } = renderHook(() => 
      useTransformedData({
        datasets: {
          primary: { data: [{ id: 1 }], columns: [], isLoading: false },
          comparison: { data: [{ id: 1 }], columns: [], isLoading: false },
        },
        joinQuery: 'SELECT * FROM primaryData JOIN comparisonData USING (id)',
      })
    );

    expect(result.current.data).toEqual([{ id: 1, value: 100 }]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should not fetch when joinQuery is null', () => {
    const { result } = renderHook(() => 
      useTransformedData({
        datasets: {
          primary: { data: [{ id: 1 }], columns: [], isLoading: false },
          comparison: { data: [{ id: 1 }], columns: [], isLoading: false },
        },
        joinQuery: null,
      })
    );

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useTransform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock transformData implementation
    (transformData as any).mockImplementation(() => 
      Promise.resolve([{ id: 1, value: 200 }])
    );
  });

  test('should transform data and return result', async () => {
    const datasets = {
      primaryData: [{ id: 1, value: 100 }],
      comparisonData: [{ id: 1, value: 50 }],
    };
    const query = 'SELECT * FROM primaryData';

    const { result } = renderHook(() => useTransform(datasets, query));

    // Initially empty
    expect(result.current).toEqual([]);

    // Wait for the effect to run
    await waitFor(() => {
      expect(transformData).toHaveBeenCalledWith(datasets, query);
      expect(result.current).toEqual([{ id: 1, value: 200 }]);
    });
  });

  test('should re-run when datasets or query changes', async () => {
    const initialDatasets = {
      primaryData: [{ id: 1, value: 100 }],
    };
    const initialQuery = 'SELECT * FROM primaryData';

    const { result, rerender } = renderHook(
      (props) => useTransform(props.datasets, props.query),
      {
        initialProps: {
          datasets: initialDatasets,
          query: initialQuery,
        },
      }
    );

    // Wait for the initial effect to run
    await waitFor(() => {
      expect(transformData).toHaveBeenCalledWith(initialDatasets, initialQuery);
    });

    // Update props
    const newDatasets = {
      primaryData: [{ id: 1, value: 200 }],
    };
    const newQuery = 'SELECT * FROM primaryData WHERE value > 150';

    rerender({
      datasets: newDatasets,
      query: newQuery,
    });

    // Wait for the effect to run again
    await waitFor(() => {
      expect(transformData).toHaveBeenCalledWith(newDatasets, newQuery);
    });

    // Verify transformData was called twice
    expect(transformData).toHaveBeenCalledTimes(2);
  });
});
