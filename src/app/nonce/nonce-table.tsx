'use client';

import { useState } from "react";
import { Query } from "@cubejs-client/core";
import { VisibilityState } from "@tanstack/react-table";
import { AnalyticsTableCoreClient } from "../analyze/analytics-table-core";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTableGroupButtons } from "@/components/data-table/data-table-group-buttons";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { NonceRecord, defaultColumnVisibility } from "./mock-data";
import { Sidebar } from "./components/sidebar";
import { useCubeDataWithComparison } from "./hooks/use-cube-data";
import { AggregationConfig, defaultAggregations } from "@/components/data-table/data-table-aggregations";
import { cn } from "@/lib/utils";

export interface NonceTableProps {
}

export function NonceTable() {
  // State for the query and comparison query
  const [query, setQuery] = useState<Query | null>(null);
  const [comparisonQuery, setComparisonQuery] = useState<Query | null>(null);

  // Use our custom hook to fetch and transform data
  const { primary, comparison } = useCubeDataWithComparison(query, comparisonQuery);
  
  // Destructure the primary data
  const { data: nonceData, columns, isLoading } = primary;
  
  // Destructure the comparison data
  const { data: comparisonData } = comparison;
  
  // Column visibility state
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>("nonce-table-visibility", defaultColumnVisibility);

  // Create custom controls with DataTableViewOptions and DataTableGroupButtons
  const customControls = (
    <div className="flex items-center justify-between mb-4">
      <DataTableGroupButtons />
      <DataTableViewOptions />
    </div>
  );

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-medium">Mining Performance Dashboard</h3>
      <div className="flex gap-4">
        <div
          data-testid="analytics-table-sidebar"
          className={cn(
            "p-1 sm:block sm:min-w-58 sm:max-w-58 sm:self-start md:min-w-58 md:max-w-58",
          )}
        >
          <Sidebar 
            nonceData={nonceData} 
            onQueryChange={setQuery} 
            onComparisonQueryChange={setComparisonQuery} 
          />
        </div>
        <div className="flex-1 w-[calc(100%-24rem)]">
          <AnalyticsTableCoreClient
            columns={columns || []}
            data={nonceData}
            pageSize={20}
            tableClassName="max-h-[calc(100vh-16rem)] overflow-y-scroll"
            defaultColumnFilters={[]}
            defaultGrouping={[]}
            filterFields={[]}
            controlsSlot={customControls}
            paginationSlot={<DataTablePagination />}
            footerAggregations={defaultAggregations.slice(1, 3) as unknown as AggregationConfig<NonceRecord>[]}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
