"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useDataTable } from "./data-table-provider";
import { Calculator } from "lucide-react";
import { defaultAggregations, AggregationType } from "@/components/data-table/aggregations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTableFooterButtons() {
  const { footerAggregations, setFooterAggregations } = useDataTable();
  
  // Get currently active aggregation types
  const activeAggregations = React.useMemo(() => 
    footerAggregations?.map(agg => agg.type) || []
  , [footerAggregations]);

  // Toggle an aggregation type
  const toggleAggregation = (type: AggregationType) => {
    if (!setFooterAggregations) return;
    
    if (activeAggregations.includes(type)) {
      // Remove the aggregation
      setFooterAggregations(
        footerAggregations?.filter(agg => agg.type !== type) || []
      );
    } else {
      // Add the aggregation
      const aggToAdd = defaultAggregations.find(agg => agg.type === type);
      if (aggToAdd) {
        setFooterAggregations([...(footerAggregations || []), aggToAdd]);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8">
          <Calculator className="mr-2 h-4 w-4" />
          Footer Aggregations
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Aggregation Types</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {defaultAggregations.map((aggregation) => (
          <DropdownMenuCheckboxItem
            key={aggregation.type}
            checked={activeAggregations.includes(aggregation.type)}
            onCheckedChange={() => toggleAggregation(aggregation.type)}
          >
            <span className="flex items-center gap-2">
              <div className="h-4 w-4">
                {aggregation.icon}
              </div>
              {aggregation.label}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
