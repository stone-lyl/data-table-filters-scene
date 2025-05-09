'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NonceRecord } from "../mock-data";
import { ChevronDown, Filter, BarChart2, ArrowLeftRight, Calendar } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
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
  ExtendedQuery
} from "../utils/query-builder";
import { Query, BinaryFilter } from "@cubejs-client/core";

interface SidebarProps {
  nonceData: NonceRecord[];
  onQueryChange?: (query: Query) => void;
}

interface CategoryProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

function Category({ title, children, icon, defaultOpen = false }: CategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-gray-200 py-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface CheckboxGroupProps {
  title: string;
  items: Array<{ id: string; name: string; }>;
  selectedItems: string[];
  onChange: (selectedIds: string[]) => void;
}

function CheckboxGroup({ title, items, selectedItems, onChange }: CheckboxGroupProps) {
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedItems, id]);
    } else {
      onChange(selectedItems.filter(item => item !== id));
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      {items.map((item) => (
        <div key={item.id} className="flex items-start space-x-1 pt-1">
          <Checkbox 
            id={item.id} 
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => handleCheckboxChange(item.id, checked === true)}
          />
          <Label htmlFor={item.id} className="text-sm">
            {item.name}
          </Label>
        </div>
      ))}
    </div>
  );
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
          icon={<Calendar className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Date Range</p>
            <div className="text-sm">
              {/* {queryState?.timeDimensions?.[0]?.dateRange[0]} to {queryState?.timeDimensions?.[0]?.dateRange[1]} */}
            </div>
          </div>
        </Category>
      </div>
    </div>
  );
}
