'use client';

import { buildJoinQuery, buildQuery } from '@/app/analyze-doc/compare/query-builder';
import { ColumnDef } from '@tanstack/react-table';
import { NonceRecord } from '../types';
import { ComparisonOption } from '../components/time-comparison-selector';
import { ExtendedQuery } from './cube-query-builder';

export const ComparePrefix = 'Pre_'
export const CompareTimeKey = 'metrics.period.day'
/**
 * Generate a SQL query to join primary and comparison data
 * @param comparisonOption The type of comparison being made
 * @param primaryColumns Sample of primary data to determine columns
 * @param comparisonColumns Sample of comparison data to determine columns
 * @returns SQL query
 */
interface GenerateComparisonQueryParams {
  comparisonOption: ComparisonOption;
  primaryColumns: ColumnDef<NonceRecord, unknown>[];
  comparisonColumns: ColumnDef<NonceRecord, unknown>[];
  queryState: ExtendedQuery;
}

export function generateComparisonQuery({
  comparisonOption,
  primaryColumns,
  comparisonColumns,
  queryState
}: GenerateComparisonQueryParams): string {
  const comparisonQuery = buildQuery({
    dataset: 'comparisonData',
    groupDimensions: [],
    fields: [
      ...comparisonColumns.map((it: ColumnDef<NonceRecord, unknown>) => ({
        name: it.id!,
        expression: `"${it.id}"`,
      })),
      {
        name: 'periodKey',
        expression: `date_add("${CompareTimeKey}"::timestamp, ${comparisonOption.dateAdd})`,
      },
    ],
  });

  const primaryQuery = buildQuery({
    dataset: 'primaryData',
    groupDimensions: [],
    fields: [
      ...primaryColumns.map((it: ColumnDef<NonceRecord, unknown>) => ({
        name: it.id!,
        expression: `"${it.id}"`,
      })),
      {
        name: 'periodKey',
        expression: `"${CompareTimeKey}"::timestamp`,
      },
    ],
  });
  
  // Build the SQL query to join the datasets
  const joinQuery = buildJoinQuery({
    left: {
      name: 'primary-data',
      query: primaryQuery,
    },
    right: {
      name: 'comparison-data',
      query: comparisonQuery,
      pick: {
        prefix: ComparePrefix,
        columns: comparisonColumns.map(it => it.id!)
      }
    },
    using: [...queryState?.dimensions ?? [], 'periodKey'], // Join on the date field
    mode: 'left'
  });

  return joinQuery;
}
