import { Calculator, ArrowDownUp, Plus, Percent } from "lucide-react";
import * as React from "react";

// Define the available aggregation types
export type AggregationType = 'count' | 'sum' | 'average' | 'percentage';

// Define the configuration for each aggregation row
export interface AggregationConfig {
  type: AggregationType;
  label: string;
  icon: React.ReactElement;
}

// Define the default aggregations
export const defaultAggregations: AggregationConfig[] = [
  { type: 'count', label: 'Count', icon: <Calculator className="h-4 w-4 text-muted-foreground" /> },
  { type: 'average', label: 'Avg', icon: <ArrowDownUp className="h-4 w-4 text-muted-foreground" /> },
  { type: 'sum', label: 'Sum', icon: <Plus className="h-4 w-4 text-muted-foreground" /> },
  { type: 'percentage', label: 'Percentage', icon: <Percent className="h-4 w-4 text-muted-foreground" /> }
];
