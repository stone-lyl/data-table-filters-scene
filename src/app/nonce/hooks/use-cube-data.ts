import { useState, useEffect, useMemo } from 'react';
import { Query } from '@cubejs-client/core';
import { useCubeQuery } from '@cubejs-client/react';
import { ColumnDef } from '@tanstack/react-table';
import { NonceRecord, ColumnStruct, generateColumns } from '../mock-data';

interface UseCubeDataResult {
  data: NonceRecord[];
  columns: ColumnDef<NonceRecord, unknown>[];
  isLoading: boolean;
}

/**
 * Custom hook to fetch and transform data from Cube.js
 * @param query The Cube.js query to execute
 * @returns Object containing data, columns, loading state, error, and progress
 */
export function useCubeData(
  query: Query | null,
): UseCubeDataResult {
  // State for data
  const [data, setData] = useState<NonceRecord[]>([]);
  
  // Use the Cube.js query hook
  const { resultSet, isLoading, error, progress } = useCubeQuery(query || {});

  // Update data when query results change
  useEffect(() => {
    if (!resultSet || isLoading || error) return;
    const queryData = resultSet.tablePivot();
    setData(queryData as unknown as NonceRecord[]);
  }, [resultSet, isLoading, error]);

  // Generate columns based on the resultSet
  const columns = useMemo(() => {
    if (!resultSet || isLoading || error) return [];
    const columnStructs = resultSet.tableColumns();
    return generateColumns(columnStructs as unknown as ColumnStruct[]) as unknown as ColumnDef<NonceRecord, unknown>[];
  }, [resultSet, isLoading, error]);

  if (error) {
    // TODO: Handle error
    console.error(error);
  }

  return {
    data,
    columns,
    isLoading: isLoading || !resultSet,
  };
}

/**
 * Custom hook to fetch and transform both primary and comparison data from Cube.js
 * @param query The primary Cube.js query
 * @param comparisonQuery The comparison Cube.js query
 * @returns Object containing primary and comparison data, columns, and loading states
 */
export function useCubeDataWithComparison(
  query: Query | null,
  comparisonQuery: Query | null,
) {
  // Get primary data
  const primary = useCubeData(query);
  
  // Get comparison data
  const comparison = useCubeData(comparisonQuery);

  if (!primary.isLoading && !comparison.isLoading) {
    console.log('primary', primary);
    console.log('comparison', comparison);
  }
  
  return {
    primary,
    comparison
  };
}
