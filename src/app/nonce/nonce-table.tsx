'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useCubeQuery } from '@cubejs-client/react';
import { Query, ProgressResponse } from '@cubejs-client/core';
import { createDefaultQuery } from './utils/query-builder';

export interface NonceTableProps {
  initialData?: NonceRecord[];
}

export function NonceTable({ initialData = [] }: NonceTableProps) {
  // State for the query
  const [query, setQuery] = useState<Query | null>(null);

  // Use the query from the sidebar or fallback to null
  const { resultSet, isLoading, error, progress } = useCubeQuery(query || {});

  // State for nonce data
  const [nonceData, setNonceData] = useState<NonceRecord[]>(initialData || []);

  // Handle query changes from the sidebar
  const handleQueryChange = useCallback((newQuery: Query) => {
    setQuery(newQuery);
  }, []);
  console.log('nonceTable query', query);

  // Update data when query results change
  useEffect(() => {
    if (!resultSet || isLoading || error) return;
    const data = resultSet.tablePivot();
    setNonceData(data as unknown as NonceRecord[]);
  }, [resultSet, isLoading, error]);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>("nonce-table-visibility", defaultColumnVisibility);

  // Generate columns based on the columnsStruct
  const columns = useMemo(() => {
    if (!resultSet || isLoading || error) return [];
    const columns = resultSet.tableColumns();
    return generateColumns(columns as unknown as ColumnStruct[]) as unknown as ColumnDef<NonceRecord, unknown>[];
  }, [resultSet, isLoading, error]);

  // Create custom controls with DataTableViewOptions and DataTableGroupButtons
  const customControls = (
    <div className="flex items-center justify-between mb-4">
      <DataTableGroupButtons />
      <DataTableViewOptions />
    </div>
  );

  // Show error message if there's an error
  if (error) {
    return <div className="p-4 text-red-500">{error.toString()}</div>;
  }

  // These values will only be used for logging, not for rendering
  const dataSource = resultSet?.tablePivot() || [];
  const columns1 = resultSet?.tableColumns() || [];

  // console.log('nonce page dataSource', dataSource);
  // console.log('nonce page columns', columns1);
  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-medium">Mining Performance Dashboard</h3>
      <div className="flex gap-4">
        <div
          data-testid="analytics-table-sidebar"
          className={cn(
            "w-full p-1 sm:block sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-58 md:max-w-58",
          )}
        >
          <Sidebar nonceData={nonceData} onQueryChange={handleQueryChange} />
        </div>
        <div className="flex-1 w-[calc(100%-24rem)]">
          <AnalyticsTableCoreClient
            columns={columns || []}
            data={nonceData}
            pageSize={20}
            tableClassName="h-[calc(100vh-16rem)] overflow-y-scroll"
            defaultColumnFilters={[]}
            defaultGrouping={[]}
            filterFields={[]}
            controlsSlot={customControls}
            // sidebarSlot={customSidebar}
            paginationSlot={<DataTablePagination />}
            footerAggregations={defaultAggregations.slice(1, 3) as unknown as AggregationConfig<NonceRecord>[]}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            isLoading={isLoading || !resultSet}
            loadingComponent={
              progress && progress.stage ? (
                <div className="flex items-center justify-center w-full h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-gray-500">{progress.stage}</p>
                    {/* Check if progress has a percent property using type assertion */}
                    {(progress as any).percent != null && (
                      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(progress as any).percent * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
