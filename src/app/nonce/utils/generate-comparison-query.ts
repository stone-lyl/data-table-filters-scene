'use client';

import { buildJoinQuery, buildQuery } from '@/app/analyze/compare/query-builder';
import { AccessorColumnDef, ColumnDef } from '@tanstack/react-table';
import { NonceRecord } from '../types';
import { ComparisonOption } from '../components/time-comparison-selector';

export const CompareTimeKey = 'metrics.period.day'
/**
 * Generate a SQL query to join primary and comparison data
 * @param comparisonOption The type of comparison being made
 * 
 * @param primaryData Sample of primary data to determine columns
 * @param comparisonData Sample of comparison data to determine columns
 * @returns SQL query
 */
export function generateComparisonQuery(
  comparisonOption: ComparisonOption,
  primaryColumns: ColumnDef<NonceRecord, unknown>[],
  comparisonColumns: ColumnDef<NonceRecord, unknown>[]
): string {
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
        prefix: 'Pre_',
        columns: comparisonColumns.map(it => it.id!)
      }
    },
    using: ['periodKey'], // Join on the date field
    mode: 'left'
  });

  return joinQuery;
}
