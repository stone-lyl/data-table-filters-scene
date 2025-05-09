'use client';

import { NonceRecord } from "../mock-data";
import { Filter, BarChart2, ArrowLeftRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { DateRangePicker } from "./date-range-picker";
import { 
  buildQuery, 
  createDefaultQuery, 
  getAvailableMeasures, 
  getAvailableDimensions,
  getAvailableFarmNames,
  getAvailableComparisonTypes,
  updateMeasures,
  updateDimensions,
  updateFilters,
  updateComparisons,
  updateDateRange,
  ExtendedQuery
} from "../utils/query-builder";
import { Query, BinaryFilter } from "@cubejs-client/core";

import { Category } from "./category";
import { CheckboxGroup } from "./checkbox-group";

interface SidebarProps {
  nonceData: NonceRecord[];
  onQueryChange?: (query: Query) => void;
}

export function Sidebar({ nonceData, onQueryChange }: SidebarProps) {
  // Get measures and dimensions from sidebar meta
  const measures = getAvailableMeasures();
  const dimensions = getAvailableDimensions();
  const farmNames = getAvailableFarmNames();
  const comparisonTypes = getAvailableComparisonTypes();
  
  // Group measures by folder
  const measuresByFolder = measures.reduce((acc, measure) => {
    const folder = measure.folder || 'Other';
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push({
      id: measure.name,
      name: measure.shortTitle
    });
    return acc;
  }, {} as Record<string, Array<{ id: string; name: string; }>>);

  // State for query
  const [queryState, setQueryState] = useState<ExtendedQuery>(createDefaultQuery());

  console.log(queryState, 'queryState ??')
  // Update query when selections change
  useEffect(() => {
    if (onQueryChange) {
      const query = buildQuery(queryState);
      onQueryChange(query);
    }
  }, [queryState, onQueryChange]);

  // Check if a measure is selected
  const isMeasureSelected = (measure: string) => {
    return queryState.measures?.includes(measure) || false;
  };

  // Check if a dimension is selected
  const isDimensionSelected = (dimension: string) => {
    return queryState.dimensions?.includes(dimension) || false;
  };

  // Check if a farm is selected
  const isFarmSelected = (farm: string) => {
    const farmFilter = queryState.filters?.find(
      f => (f as BinaryFilter).member === 'metrics.workspace_name'
    ) as BinaryFilter | undefined;
    return farmFilter ? farmFilter.values.includes(farm) : false;
  };

  // Check if a comparison type is selected
  const isComparisonSelected = (comparisonType: string) => {
    return queryState.comparisons?.includes(comparisonType) || false;
  };

  // Handle measure selection
  const handleMeasureChange = (folder: string, selectedIds: string[]) => {
    // Get all currently selected measures from other folders
    const currentMeasures = queryState.measures || [];
    const otherFolderMeasures = Object.entries(measuresByFolder)
      .filter(([folderName]) => folderName !== folder)
      .flatMap(([_, items]) => items.map(item => item.id))
      .filter(id => currentMeasures.includes(id));
    
    // Combine with newly selected measures from this folder
    const newMeasures = [...otherFolderMeasures, ...selectedIds];
    
    setQueryState(updateMeasures(queryState, newMeasures));
  };

  // Handle breakdown selection
  const handleBreakdownChange = (selectedIds: string[]) => {
    setQueryState(updateDimensions(queryState, selectedIds));
  };

  // Handle farm filter selection
  const handleFarmChange = (farms: string[]) => {
    setQueryState(updateFilters(
      queryState, 
      'metrics.workspace_name', 
      'equals', 
      farms
    ));
  };

  // Handle comparison selection
  const handleComparisonChange = (selectedIds: string[]) => {
    setQueryState(updateComparisons(queryState, selectedIds));
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const formattedFrom = format(range.from, 'yyyy-MM-dd');
      const formattedTo = format(range.to, 'yyyy-MM-dd');
      
      setQueryState(updateDateRange(queryState, [formattedFrom, formattedTo]));
    }
  };
  
  // Initialize date range from query or default to last 7 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const defaultFrom = queryState?.timeDimensions?.[0]?.dateRange?.[0] 
      ? new Date(queryState.timeDimensions[0].dateRange[0]) 
      : subDays(new Date(), 7);
    
    const defaultTo = queryState?.timeDimensions?.[0]?.dateRange?.[1]
      ? new Date(queryState.timeDimensions[0].dateRange[1])
      : new Date();
      
    return {
      from: defaultFrom,
      to: defaultTo
    };
  });

  return (
    <div className="w-full border-r border-gray-200 p-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="space-y-1">
        <div className="pb-2 mb-2">
          <h3 className="text-base font-medium">Hashing</h3>
        </div>
        
        <Category 
          title="Measure" 
          icon={<BarChart2 className="h-4 w-4" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {Object.entries(measuresByFolder).map(([folder, items]) => {
              const currentMeasures = queryState.measures || [];
              const selectedIds = items
                .filter(item => currentMeasures.includes(item.id))
                .map(item => item.id);
              
              return (
                <div key={folder} className="space-y-1">
                  <div className="font-medium">{folder}</div>
                  <div className="pl-4 space-y-1">
                    <CheckboxGroup
                      title="Measures"
                      items={items}
                      selectedItems={selectedIds}
                      onChange={(newSelectedIds) => handleMeasureChange(folder, newSelectedIds)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Category>
        
        <Category 
          title="Breakdown" 
          icon={<ArrowLeftRight className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <CheckboxGroup
              title="Dimensions"
              items={dimensions.map(dim => ({ id: dim.name, name: dim.shortTitle }))}
              selectedItems={queryState.dimensions || []}
              onChange={handleBreakdownChange}
            />
          </div>
        </Category>
        
        <Category 
          title="Filter" 
          icon={<Filter className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <CheckboxGroup
              title="Farm Name"
              items={farmNames.map(farm => ({ 
                id: farm, 
                name: farm 
              }))}
              selectedItems={queryState.filters
                ? (queryState.filters.find(filter => 
                    (filter as BinaryFilter).member === 'metrics.workspace_name'
                  ) as BinaryFilter | undefined)?.values || []
                : []}
              
              onChange={handleFarmChange}
            />
          </div>
        </Category>
        
        <Category 
          title="Compare" 
          icon={<ArrowLeftRight className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <CheckboxGroup
              title="Comparisons"
              items={comparisonTypes}
              selectedItems={queryState.comparisons || []}
              onChange={handleComparisonChange}
            />
          </div>
        </Category>

        <Category 
          title="Time Range" 
          icon={<CalendarIcon className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">timeDimensions</p>
            <DateRangePicker
              initialDateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                handleDateRangeChange(range);
              }}
            />
          </div>
        </Category>
      </div>
    </div>
  );
}
