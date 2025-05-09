'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnalyticsTableCoreClient } from '../analyze/analytics-table-core';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableGroupButtons } from '@/components/data-table/data-table-group-buttons';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { ColumnStruct, defaultColumnVisibility, generateColumns, NonceRecord } from './mock-data';
import { Sidebar } from './components/sidebar';
import { AggregationConfig, defaultAggregations } from '@/components/data-table/data-table-aggregations';
import { cn } from '@/lib/utils';
import { getHashingDataQuery } from './cube-client';
import { useCubeQuery } from '@cubejs-client/react';

export interface NonceTableProps {
  initialData?: NonceRecord[];
}

export function NonceTable({ initialData = [] }: NonceTableProps) {
  const { resultSet, isLoading, error, progress } = useCubeQuery(getHashingDataQuery());
  // State for nonce data
  const [nonceData, setNonceData] = useState<NonceRecord[]>(initialData || []);
  
  useEffect(() => {
    if (!resultSet || isLoading || error) return;
    const data = resultSet.tablePivot();
    setNonceData(data as unknown as NonceRecord[]);
  }, [resultSet, isLoading, error]);
  // Column visibility state
  const [columnVisibility, setColumnVisibility] =
  useLocalStorage<VisibilityState>("nonce-table-visibility", defaultColumnVisibility);

  // Generate columns based on the columnsStruct
  const columns = useMemo(() =>{
    if (!resultSet || isLoading || error) return [];
    const columns = resultSet.tableColumns();
    return generateColumns(columns as unknown as ColumnStruct[]) as unknown as ColumnDef<NonceRecord, unknown>[];
  } , [resultSet, isLoading, error]);
  
  // Create custom controls with DataTableViewOptions and DataTableGroupButtons
  const customControls = (
    <div className="flex items-center justify-between mb-4">
      <DataTableGroupButtons />
      <DataTableViewOptions />
    </div>
  );
  
  const customSidebar = (
    <div
    data-testid="analytics-table-sidebar"
    className={cn(
      "w-full p-1 sm:block sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-58 md:max-w-58",
    )}
    >
      <Sidebar nonceData={nonceData} />
    </div>
  );
  
  if (isLoading) {
    return <div>{progress && progress.stage && progress.stage || 'Loading...'}</div>;
  }
  
  if (error) {
    return <div>{error.toString()}</div>;
  }
  
  if (!resultSet) {
    return null;
  }
  
  const dataSource = resultSet.tablePivot();
  const columns1 = resultSet.tableColumns();


  // console.log('nonce page dataSource', dataSource);
  // console.log('nonce page columns', columns1);
  return (
      <div className="p-4">
        <h3 className="mb-4 text-lg font-medium">Mining Performance Dashboard</h3>
        <div className="flex gap-4">
          <div className="flex-1 w-[calc(100%-24rem)]">
            <AnalyticsTableCoreClient
              columns={columns}
              data={nonceData}
              pageSize={20}
              tableClassName="h-[calc(100vh-16rem)] overflow-y-scroll"
              defaultColumnFilters={[]}
              defaultGrouping={[]}
              filterFields={[]}
              controlsSlot={customControls}
              sidebarSlot={customSidebar}
              paginationSlot={<DataTablePagination />}
              footerAggregations={defaultAggregations.slice(1, 3) as unknown as AggregationConfig<NonceRecord>[]}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
            />
          </div>
        </div>
      </div>
  );
}
