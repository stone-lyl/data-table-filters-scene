import { useState, useEffect, useMemo } from 'react';
import { Query, BinaryFilter } from '@cubejs-client/core';
import { useCubeQuery } from '@cubejs-client/react';
import { ColumnDef } from '@tanstack/react-table';
import { NonceRecord, ColumnStruct, generateColumns } from '../mock-data';
import { buildQuery, createComparisonQuery, ExtendedQuery } from '../utils/cube-query-builder';
import { generateComparisonQuery } from '../utils/generate-comparison-query';
import { ComparisonOption } from '../components/time-comparison-selector';
import { useTransformedData } from './use-transformed-data';

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
 * Custom hook to fetch and transform data based on query state and comparison selection
 * @param queryState The extended query state
 * @param selectedComparison The selected comparison option
 * @returns Object containing primary and comparison data, columns, and loading states
 */
export function useCubeDataWithComparison(
  queryState: ExtendedQuery | null,
  selectedComparison: ComparisonOption | null
) {
  // Build queries from state
  const query = useMemo(() => {
    return queryState ? buildQuery(queryState) : null;
  }, [queryState]);

  const comparisonQuery = useMemo(() => {
    if (queryState && selectedComparison) {
      return createComparisonQuery(queryState, selectedComparison.value);
    }
    return null;
  }, [queryState, selectedComparison]);

  const primary = useCubeData(query);
  
  const comparison = useCubeData(comparisonQuery);

  const joinQuery = useMemo(() => {
    if (primary.data.length === 0 || comparison.data.length === 0) {
      return '';
    }
    return generateComparisonQuery(
      selectedComparison,
      primary.data,
      comparison.data
    );
  }, [primary.data, comparison.data, selectedComparison]);

  // Transform the data using SWR-based hook
  const datasets = {
    primaryData: primary.data,
    comparisonData: comparison.data
  };
  const { data: transformedData, isLoading: isTransformedLoading } = useTransformedData({ datasets, joinQuery });
  
  const comparisonLoading = (() => {
    if(selectedComparison) {
      return comparison.isLoading || isTransformedLoading;
    }
    return false;
  })();

  
  return {
    data: joinQuery ? transformedData : primary.data,
    columns: primary.columns,
    isLoading: primary.isLoading || comparisonLoading,
  };
}
