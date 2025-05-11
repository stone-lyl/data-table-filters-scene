'use client';

import { NonceRecord } from "../types";
import { Filter, BarChart2, ArrowLeftRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays, addDays, subYears } from "date-fns";
import { DateRangePicker } from "./date-range-picker";
import { TimeComparisonSelector, ComparisonOption } from "./time-comparison-selector";
import {
  createDefaultQuery,
  getAvailableMeasures,
  getAvailableDimensions,
  getAvailableFarmNames,
  updateMeasures,
  updateDimensions,
  updateFilters,
  updateDateRange,
  ExtendedQuery
} from "../utils/cube-query-builder";
import { Query, BinaryFilter } from "@cubejs-client/core";

import { Category } from "./category";
import { CheckboxGroup } from "./checkbox-group";

interface SidebarProps {
  nonceData: NonceRecord[];
  onQueryStateChange?: (queryState: ExtendedQuery) => void;
  onComparisonChange?: (comparison: ComparisonOption | null) => void;
}

export function Sidebar({ nonceData, onQueryStateChange, onComparisonChange }: SidebarProps) {
  // Get measures and dimensions from sidebar meta
  const measures = getAvailableMeasures();
  const dimensions = getAvailableDimensions();
  const farmNames = getAvailableFarmNames();


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

  const [queryState, setQueryState] = useState<ExtendedQuery>(createDefaultQuery());
  const [selectedComparison, setSelectedComparison] = useState<ComparisonOption | null>(null);

  useEffect(() => {
    if (onQueryStateChange) {
      onQueryStateChange(queryState);
    }
  }, [queryState, onQueryStateChange]);

  // Pass comparison selection to parent when it changes
  useEffect(() => {
    if (onComparisonChange) {
      onComparisonChange(selectedComparison);
    }
  }, [selectedComparison, onComparisonChange]);

  const handleMeasureChange = (folder: string, selectedIds: string[]) => {
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

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const formattedFrom = format(range.from, 'yyyy-MM-dd');
      const formattedTo = format(range.to, 'yyyy-MM-dd');

      setQueryState(updateDateRange(queryState, [formattedFrom, formattedTo]));
    }
  };

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

        {
          (queryState?.dimensions || [])?.length > 0 && (
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
                    ? (queryState.filters.find((filter: any) =>
                      (filter as BinaryFilter).member === 'metrics.workspace_name'
                    ) as BinaryFilter | undefined)?.values || []
                    : []}

                  onChange={handleFarmChange}
                />
              </div>
            </Category>
          )
        }

        <Category
          title="Compare"
          icon={<ArrowLeftRight className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <TimeComparisonSelector
              selectedOption={selectedComparison}
              onSelect={setSelectedComparison}
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
              onDateRangeChange={(range) => {
                handleDateRangeChange(range);
              }}
            />
          </div>
        </Category>
      </div>
    </div>
  );
}
