'use client';

import { useMemo, useState } from 'react';
import { AnalyticsTableCoreClient } from '../analyze/analytics-table-core';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableGroupButtons } from '@/components/data-table/data-table-group-buttons';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { VisibilityState, Table } from '@tanstack/react-table';
import { defaultColumnVisibility, generateColumns, NonceRecord } from './mock-data';
import { Sidebar } from './components/sidebar';
import { AggregationConfig, defaultAggregations } from '@/components/data-table/data-table-aggregations';
import { Calculator, ArrowDownUp, Plus } from 'lucide-react';

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
  
  // Create custom pagination slot
  const customPagination = <DataTablePagination />;
  
  // Define footer aggregations
  // Cast the aggregation methods to the correct type to fix TypeScript errors
  const sumAggregationMethod = defaultAggregations[2].aggregationMethod as unknown as (
    columnId: string, 
    values: any[], 
    table: Table<NonceRecord>
  ) => React.ReactNode;
  
  const avgAggregationMethod = defaultAggregations[1].aggregationMethod as unknown as (
    columnId: string, 
    values: any[], 
    table: Table<NonceRecord>
  ) => React.ReactNode;
  
  const footerAggregations: AggregationConfig<NonceRecord>[] = [
    {
      type: 'sum',
      label: 'Sum',
      icon: <Plus className="h-4 w-4 text-muted-foreground" />,
      aggregationMethod: sumAggregationMethod,
      isTotal: false
    },
    {
      type: 'average',
      label: 'Avg',
      icon: <ArrowDownUp className="h-4 w-4 text-muted-foreground" />,
      aggregationMethod: avgAggregationMethod,
      isTotal: false
    }
  ];

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-medium">Mining Performance Dashboard</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <AnalyticsTableCoreClient
            columns={columns}
            data={nonceData}
            pageSize={20}
            tableClassName="h-[calc(100vh-16rem)] overflow-y-scroll"
            defaultColumnFilters={[]}
            defaultGrouping={[]}
            filterFields={[]}
            controlsSlot={customControls}
            paginationSlot={customPagination}
            footerAggregations={defaultAggregations.slice(1,3) as unknown as AggregationConfig<NonceRecord>[]}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </div>
        <Sidebar nonceData={nonceData} summaryData={summaryData} />
      </div>
    </div>
  );
}
