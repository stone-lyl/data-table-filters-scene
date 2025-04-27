"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useDataTable } from "./data-table-provider";

export function DataTableGroupButtons() {
  const { table, grouping } = useDataTable();

  // add the row group title here, the title should be unique row
  return (
    <div>
      <p className="text-muted-foreground">Row Group by</p>
      <div className="flex gap-2 mb-2">
        {table.getAllLeafColumns().map(column => {
          // Skip columns that don't make sense for grouping
          if (!column.getCanGroup()) return null;

          return (
            <Button
              key={column.id}
              variant={grouping.includes(column.id) ? "default" : "outline"}
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
    </div>
  );
}
