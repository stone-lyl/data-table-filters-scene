'use client';

import { buildJoinQuery, buildQuery } from '@/app/analyze/compare/query-builder';
import { ColumnDef } from '@tanstack/react-table';
import { NonceRecord } from '../mock-data';
import { ComparisonOption } from '../components/time-comparison-selector';

/**
 * Generate a SQL query to join primary and comparison data
 * @param comparisonOption The type of comparison being made
 * @param primaryData Sample of primary data to determine columns
 * @param comparisonData Sample of comparison data to determine columns
 * @returns SQL query
 */
export function generateComparisonQuery(
  comparisonOption: ComparisonOption | null,
  primaryData: NonceRecord[],
  comparisonData: NonceRecord[]
): string {
  if (!comparisonOption || primaryData.length === 0 || comparisonData.length === 0) {
    return '';
  }

  const comparisonQuery = buildQuery({
    dataset: 'comparisonData',
    groupDimensions: [],
    fields: [
      ...getColumnNames(primaryData).map((it) => ({
        name: it,
        expression: `"${it}"`,
      })),
      {
        name: 'periodKey',
        expression: `date_add("metrics.period.day"::timestamp, ${comparisonOption.dateAdd})`,
      },
    ],
  });

  const primaryQuery = buildQuery({
    dataset: 'primaryData',
    groupDimensions: [],
    fields: [
      ...getColumnNames(comparisonData).map((it) => ({
        name: it,
        expression: `"${it}"`,
      })),
      {
        name: 'periodKey',
        expression: `"metrics.period.day"::timestamp`,
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
        columns: getColumnNames(comparisonData)
      }
    },
    using: ['periodKey'], // Join on the date field
    mode: 'left'
  });

  return joinQuery;
}

/**
 * Get column names from a dataset
 * @param data The dataset to get column names from
 * @returns Array of column names
 */
function getColumnNames(data: any[]): string[] {
  if (data.length === 0) return [];
  
  // Get all keys from the first object and filter out any that are not strings or numbers
  return Object.keys(data[0]);
}
