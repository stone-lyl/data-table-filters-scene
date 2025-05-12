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
import { DataTablePagination } from '@/components/data-table/data-table-pagination';

export default function CompareTable() {
  const [currentYear] = useState(() =>
    generateSalesDataset({ count: 5000, from: '2024-01-01', to: '2024-6-30' })
  );
  const [lastYear] = useState(() =>
    generateSalesDataset({ count: 5000, from: '2023-01-01', to: '2023-6-30' })
  );
  const datasets = useMemo(
    () => ({ currentYear, lastYear }),
    [currentYear, lastYear]
  );
  
  const [columnVisibility, setColumnVisibility] = 
    useLocalStorage<VisibilityState>("compare-table-visibility", defaultColumnVisibility);
  const currentYearTableName = 'currentYear';
  const lastYearTableName = 'lastYear';
  /**
   * 声明一个 totalAmount 字段，它是一个通过 SUM 函数聚合的度量值
   * @param table 表名
   * @returns 
   */
  const totalAmount = (table: string) => ({
    name: 'totalAmount',
    expression: Aggregations.sum({
      tableName: table,
      columnName: 'totalAmount',
    }),
  });
  /**
   * 声明一个 totalQuantity 字段，它是一个通过 SUM 函数聚合的度量值
   * @param table 表名
   * @returns 
   */
  const totalQuantity = (table: string) => ({
    name: 'totalQuantity',
    expression: Aggregations.sum({
      tableName: table,
      columnName: 'quantity',
    }),
  });
  /**
   * 指定了 table 明细表的分组维度
   * @param table 表名
   * @returns 
   */
  const groupDims = (table: string) => [
    { tableName: table, columnName: 'storeRegion' },
    { tableName: table, columnName: 'paymentMethod' },
  ];

  /**
   * 构建 lastYear 表的查询
   * @returns 
   */
  const lastYearQuery = buildQuery({
    dataset: lastYearTableName,
    groupDimensions: groupDims(lastYearTableName),
    segments: [
      {
        name: 'yearMonth',
        expression: `datetrunc('month', "date"::timestamp)`
      }
    ],
    fields: [
      totalAmount(lastYearTableName),
      totalQuantity(lastYearTableName),
      {
        name: 'periodKey',
        expression: 'date_add("yearMonth", INTERVAL 1 YEAR)',
      },
    ],
  });
  const currentYearQuery = buildQuery({
    dataset: currentYearTableName,
    groupDimensions: groupDims(currentYearTableName),
    segments: [
      {
        name: 'yearMonth',
        expression: `datetrunc('month', "${currentYearTableName}"."date"::timestamp)`
      }
    ],
    fields: [
      totalAmount(currentYearTableName),
      totalQuantity(currentYearTableName),
      { name: 'periodKey', expression: `"yearMonth"` },
      {
        name: 'lastMonthQuantity',
        expression: windowFunctions.lag('"totalQuantity"', 1, null, {
          partitionBy: groupDims(currentYearTableName).map(
            (it) => it.columnName
          ),
          orderBy: 'yearMonth',
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
        columns: ['totalAmount', 'totalQuantity', 'yearMonth'],
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
    <div className="p-4 space-y-8">
      <h3 className="mb-2 text-lg font-medium">DuckDB Data Analysis</h3>
      <div className="mb-4 text-sm text-muted-foreground">
        <p>
          <b>Compare Table</b> (below) is a join of the two original tables: <b>Current Year</b> and <b>Last Year</b>.
        </p>
        <p className="mt-1">
          The original tables are shown below for reference. The comparison table joins them on storeRegion, paymentMethod and datetrunc the date to month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Current Year Table</h4>
          <AnalyticsTableCoreClient
            columns={generateColumns(currentYear)}
            data={currentYear}
            pageSize={30}
            tableClassName="h-96 overflow-y-scroll"
            paginationSlot={<DataTablePagination />}
          />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Last Year Table</h4>
          <AnalyticsTableCoreClient
            columns={generateColumns(lastYear)}
            data={lastYear}
            pageSize={30}
            tableClassName="h-96 overflow-y-scroll"
            paginationSlot={<DataTablePagination />}
          />
        </div>
      </div>

      <div className="mt-8">
        <h4 className="font-semibold mb-2">Compare Table (Join Result)</h4>
        <AnalyticsTableCoreClient
          columns={columns}
          data={data}
          tableClassName="h-[calc(100vh-2rem)] overflow-y-scroll"
          defaultColumnFilters={[]}
          defaultGrouping={[]}
          filterFields={[]}
          controlsSlot={customControls}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          paginationSlot={<DataTablePagination />}
        />
      </div>
    </div>
  );
}
