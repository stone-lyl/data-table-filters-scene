"use client";

import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import * as React from "react";

interface DataTableGroupButtonsProps<TData> {
  table: Table<TData>;
}

export function DataTableGroupButtons<TData>({
  table,
}: DataTableGroupButtonsProps<TData>) {
  return (
    <div className="flex gap-2 mb-2">
      {table.getAllLeafColumns().map(column => {
        // Skip columns that don't make sense for grouping
        if (!column.getCanGroup()) return null;
        
        return (
          <Button
            key={column.id}
            variant={column.getIsGrouped() ? "default" : "outline"}
            size="sm"
            onClick={() => {
              column.getToggleGroupingHandler()();
            }}
          >
            {column.id}
          </Button>
        );
      })}            
    </div>
  );
}
