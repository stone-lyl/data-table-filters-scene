'use client';

import { useState } from "react";
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
import { ExtendedQuery } from "./utils/cube-query-builder";
import { ComparisonOption } from "./components/time-comparison-selector";

export interface NonceTableProps {
}

export function NonceTable() {
  // State for the query state and comparison selection
  const [queryState, setQueryState] = useState<ExtendedQuery | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonOption | null>(null);

  // Use our custom hook to fetch and transform data based on query state and comparison
  const { primary, comparison, joined } = useCubeDataWithComparison(queryState, selectedComparison);
  
  // Destructure the primary data
  const { data: nonceData, columns: primaryColumns, isLoading: isPrimaryLoading } = primary;
  
  // Destructure the comparison data
  const { data: comparisonData } = comparison;
  
  // Destructure the joined data (combined primary and comparison)
  const { data: joinedData, columns: joinedColumns, isLoading: isJoinedLoading } = joined;
  
  // Use joined data and columns when comparison is selected, otherwise use primary data
  const displayData = nonceData;
  const displayColumns = primaryColumns;
  const isLoading = isPrimaryLoading;
  
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
            onQueryStateChange={setQueryState} 
            onComparisonChange={setSelectedComparison} 
          />
        </div>
        <div className="flex-1 w-[calc(100%-24rem)]">
          <AnalyticsTableCoreClient
            columns={displayColumns || []}
            data={displayData}
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
