'use client';

import { useMemo, useState } from 'react';
import { AnalyticsTableCoreClient } from '../analyze/analytics-table-core';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableGroupButtons } from '@/components/data-table/data-table-group-buttons';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { VisibilityState } from '@tanstack/react-table';
import { defaultColumnVisibility, generateColumns, NonceRecord } from './mock-data';
import { Sidebar } from './components/sidebar';
import { AggregationConfig, defaultAggregations } from '@/components/data-table/data-table-aggregations';
import { cn } from '@/lib/utils';

interface NonceTableProps {
  initialData?: NonceRecord[];
}

export function NonceTable({ initialData }: NonceTableProps) {
  // Generate mock data for the nonce table or use provided data
  const [nonceData] = useState(initialData || []);
  
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = 
    useLocalStorage<VisibilityState>("nonce-table-visibility", defaultColumnVisibility);

  // Generate columns based on the data
  const columns = useMemo(() => generateColumns(nonceData), [nonceData]);
  
  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalEarning = nonceData.reduce((sum, record) => sum + record.earning, 0);
    const totalCost = nonceData.reduce((sum, record) => sum + record.cost, 0);
    const profit = totalEarning - totalCost;
    
    return {
      totalEarning,
      totalCost,
      profit
    };
  }, [nonceData]);
  
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
      <Sidebar nonceData={nonceData} summaryData={summaryData} />
    </div>
  );
  
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

            footerAggregations={defaultAggregations.slice(1,3) as unknown as AggregationConfig<NonceRecord>[]}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </div>
        {/* <Sidebar nonceData={nonceData} summaryData={summaryData} /> */}
      </div>
    </div>
  );
}
