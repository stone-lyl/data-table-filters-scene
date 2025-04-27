"use client";

import * as React from "react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { AggregationType, defaultAggregations } from "../../components/data-table/aggregations";

export function DataTableFooterControls() {
  const { footerAggregations, setFooterAggregations } = useDataTable();
  
  // Initialize with default or current aggregations
  const [selectedAggregations, setSelectedAggregations] = React.useState<AggregationType[]>(
    footerAggregations?.map(agg => agg.type) || ['count', 'average', 'sum']
  );

  // Update the data table state when selections change
  React.useEffect(() => {
    if (setFooterAggregations) {
      const newAggregations = defaultAggregations.filter(agg => 
        selectedAggregations.includes(agg.type)
      );
      setFooterAggregations(newAggregations);
    }
  }, [selectedAggregations, setFooterAggregations]);

  // Toggle an aggregation type
  const toggleAggregation = (type: AggregationType) => {
    setSelectedAggregations(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-muted-foreground">Footer Aggregations</h4>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {defaultAggregations.map((aggregation) => {
          const isSelected = selectedAggregations.includes(aggregation.type);
          return (
            <Toggle
              key={aggregation.type}
              variant="outline"
              size="sm"
              pressed={isSelected}
              onPressedChange={() => toggleAggregation(aggregation.type)}
              className={cn(
                "gap-1 text-xs",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <div className={cn("h-3.5 w-3.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                {aggregation.icon}
              </div>
              <span>{aggregation.label}</span>
            </Toggle>
          );
        })}
      </div>
    </div>
  );
}
