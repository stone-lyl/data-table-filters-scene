'use client';

import { useMemo, useState } from 'react';
import { generateSalesDataset } from './mock-data';
import { useTransform } from './use-transform';
import {
  Aggregations,
  buildJoinQuery,
  buildQuery,
  windowFunctions,
} from './query-builder';

function generateColumns(data: unknown[]) {
  if (data.length === 0) return [];

  const firstRow = data[0] as Record<string, unknown>;
  return Object.keys(firstRow).map((key) => {
    const column = {
      title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      dataIndex: key,
      key: key,
    };

    // Add special rendering for specific data types
    const value = firstRow[key];
    // https://github.com/duckdb/duckdb-wasm/issues/873
    if (typeof value === 'number') {
      if (
        key.toLowerCase().includes('price') ||
        key.toLowerCase().includes('amount')
      ) {
        return {
          ...column,
          render: (val: number) => `$${val.toFixed(2)}`,
        };
      } else if (
        key.toLowerCase().includes('percentage') ||
        key.toLowerCase().includes('discount')
      ) {
        return {
          ...column,
          render: (val: number) => `${val}%`,
        };
      }
    } else {
      return {
        ...column,
        render: (val?: string) => val?.valueOf(),
      };
    }

    return column;
  });
}

export default function DuckDb() {
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
  const currentYearTableName = 'currentYear';
  const totalAmount = (table: string) => ({
    name: 'monthlyTotalAmount',
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
        name: 'year_month',
        expression: `datetrunc('month', "date"::timestamp)`
      }
    ],
    measures: [
      totalAmount('lastYear'),
      totalQuantity('lastYear'),
      {
        name: 'periodKey',
        expression: 'date_add("year_month", INTERVAL 1 YEAR)',
      },
      {
        name: 'periodDate',
        expression: `"year_month"`,
      },
    ],
  });
  const currentYearQuery = buildQuery({
    dataset: currentYearTableName,
    groupDimensions: groupDims(currentYearTableName),
    segments: [
      {
        name: 'year_month',
        expression: `datetrunc('month', "currentYear"."date"::timestamp)`
      }
    ],
    measures: [
      totalAmount(currentYearTableName),
      totalQuantity(currentYearTableName),
      { name: 'periodKey', expression: `"year_month"` },
      {
        name: 'lastMonthAmount',
        expression: windowFunctions.lag('"monthlyTotalAmount"', 1, null, {
          partitionBy: groupDims(currentYearTableName).map(
            (it) => it.columnName
          ),
          orderBy: 'year_month',
        }),
      },
      {
        name: 'lastMonthQuantity',
        expression: windowFunctions.lag('"totalQuantity"', 1, null, {
          partitionBy: groupDims(currentYearTableName).map(
            (it) => it.columnName
          ),
          orderBy: 'year_month',
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
        prefix: 'compare_',
        columns: ['monthlyTotalAmount', 'totalQuantity', 'periodDate'],
      },
    },
    using: [...groupDims('').map((it) => it.columnName), 'periodKey'],
    mode: 'left',
  });
  const data = useTransform(datasets, query);

  const columns = generateColumns(data);

  console.log('duckdb columns', columns);
  console.log('duckdb data', data);
  return (
    <div style={{ padding: '24px' }}>
        duckdb component
      {/* <Table<unknown>
        columns={columns}
        dataSource={data}
        rowKey="transactionId"
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      /> */}
    </div>
  );
}
