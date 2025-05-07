'use client';

import { useMemo, useState } from 'react';
import { defaultColumnVisibility, generateColumns, generateSalesDataset } from './mock-data';
import { useTransform } from '../analyze/compare/use-transform';
import { AnalyticsTableCoreClient } from '../analyze/analytics-table-core';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableGroupButtons } from '@/components/data-table/data-table-group-buttons';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { VisibilityState } from '@tanstack/react-table';
import {
  Aggregations,
  buildJoinQuery,
  buildQuery,
  windowFunctions,
} from '../analyze/compare/query-builder';

export default function CompareTable() {
  const [currentYear] = useState(() =>
    generateSalesDataset({ count: 5000, from: '2024-01-01', to: '2024-12-31' })
  );
  const [lastYear] = useState(() =>
    generateSalesDataset({ count: 5000, from: '2023-01-01', to: '2023-12-31' })
  );
  const datasets = useMemo(
    () => ({ currentYear, lastYear }),
    [currentYear, lastYear]
  );
  
  // Add columnVisibility state for the table
  const [columnVisibility, setColumnVisibility] = 
    useLocalStorage<VisibilityState>("compare-table-visibility", defaultColumnVisibility);
  const currentYearTableName = 'currentYear';
  const totalAmount = (table: string) => ({
    name: 'totalAmount',
    expression: Aggregations.sum({
      tableName: table,
      columnName: 'totalAmount',
    }),
  });
  const totalQuantity = (table: string) => ({
    name: 'totalQuantity',
    expression: Aggregations.sum({
      tableName: table,
      columnName: 'quantity',
    }),
  });
  const groupDims = (table: string) => [
    { tableName: table, columnName: 'storeRegion' },
    { tableName: table, columnName: 'paymentMethod' },
  ];

  const lastYearQuery = buildQuery({
    dataset: 'lastYear',
    groupDimensions: groupDims('lastYear'),
    segments: [
      {
        name: 'current_date',
        expression: `datetrunc('month', "date"::timestamp)`
      }
    ],
    measures: [
      totalAmount('lastYear'),
      totalQuantity('lastYear'),
      {
        name: 'periodKey',
        expression: 'date_add("current_date", INTERVAL 1 YEAR)',
      },
      {
        name: 'periodDate',
        expression: `"current_date"`,
      },
    ],
  });
  const currentYearQuery = buildQuery({
    dataset: currentYearTableName,
    groupDimensions: groupDims(currentYearTableName),
    segments: [
      {
        name: 'current_date',
        expression: `datetrunc('month', "currentYear"."date"::timestamp)`
      }
    ],
    measures: [
      totalAmount(currentYearTableName),
      totalQuantity(currentYearTableName),
      { name: 'periodKey', expression: `"current_date"` },
      {
        name: 'lastMonthQuantity',
        expression: windowFunctions.lag('"totalQuantity"', 1, null, {
          partitionBy: groupDims(currentYearTableName).map(
            (it) => it.columnName
          ),
          orderBy: 'current_date',
        }),
      },
    ],
  });
  const query = buildJoinQuery({
    left: {
      name: 'currentYearResult',
      query: currentYearQuery,
    },
    right: {
      name: 'lastYearResult',
      query: lastYearQuery,
      pick: {
        prefix: 'c_',
        columns: ['totalAmount', 'totalQuantity', 'periodDate'],
      },
    },
    using: [...groupDims('').map((it) => it.columnName), 'periodKey'],
    mode: 'left',
  });
  const data = useTransform(datasets, query);

  const columns = generateColumns(data);


 
  // Create custom controls with DataTableViewOptions and DataTableGroupButtons
  const customControls = (
    <div className="flex items-center justify-between mb-4">
      <DataTableGroupButtons />
      <DataTableViewOptions />
    </div>
  );

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-medium">DuckDB Data Analysis</h3>
      <AnalyticsTableCoreClient
        columns={columns}
        data={data}
        pageSize={1000}
        tableClassName="h-[calc(100vh-16rem)] overflow-y-scroll"
        defaultColumnFilters={[]}
        defaultGrouping={[]}
        filterFields={[]}
        controlsSlot={customControls}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    </div>
  );
}
