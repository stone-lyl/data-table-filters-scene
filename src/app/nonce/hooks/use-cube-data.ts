import { useState, useEffect, useMemo } from 'react';
import { Query, BinaryFilter } from '@cubejs-client/core';
import { useCubeQuery } from '@cubejs-client/react';
import { ColumnDef } from '@tanstack/react-table';
import { NonceRecord, ColumnStruct, generateColumns } from '../mock-data';
import { buildQuery, createComparisonQuery, ExtendedQuery } from '../utils/cube-query-builder';
import { generateComparisonQuery } from '../utils/generate-comparison-query';
import { ComparisonOption } from '../components/time-comparison-selector';
import { transformData, useTransform } from '@/app/analyze/compare/use-transform';

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
  const [query, setQuery] = useState<Query | null>(null);
  const [comparisonQuery, setComparisonQuery] = useState<Query | null>(null);
  const [transformedData, setTransformedData] = useState<NonceRecord[]>([]);

  useEffect(() => {
    setComparisonQuery(queryState && selectedComparison ? 
      createComparisonQuery(queryState, selectedComparison.value) : null);
  }, [queryState, selectedComparison]);
  
  useEffect(() => {
    setQuery(queryState ? buildQuery(queryState) : null);
  }, [queryState]);

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

  // Transform the data using DuckDB
  useEffect(() => {
    if (!joinQuery) {
      setTransformedData([]);
      return;
    };
    const datasets = {
      primaryData: primary.data,
      comparisonData: comparison.data
    }
    console.log('useCubeData datasets', datasets);
    transformData(datasets, joinQuery).then((transformedData) => {
      console.log('useCubeData transformedData', transformedData);
      setTransformedData(transformedData);
    });
  }, [joinQuery, primary.data, comparison.data]);
  
  const joinedColumns = useMemo(() => {
    if(primary.columns.length !== 0 && comparison.columns.length !== 0 && joinQuery) {
      console.log('useCubeData primary.columns', primary.columns);
      console.log('useCubeData comparison.columns', comparison.columns);
      console.log('useCubeData joinQuery', joinQuery);
      return [...primary.columns];
    }
    return [];
  }, [primary.columns, comparison.columns, joinQuery]);
  const isJoinedLoading = primary.isLoading || comparison.isLoading || transformedData.length === 0;
  
  return {
    data: joinQuery ? transformedData : primary.data,
    columns: primary.columns,
    isLoading: isJoinedLoading,
    primary,
    comparison,
    joined: {
      data: transformedData,
      columns: joinedColumns,
      isLoading: isJoinedLoading
    }
  };
}
