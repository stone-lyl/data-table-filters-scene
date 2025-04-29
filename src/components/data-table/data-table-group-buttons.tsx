"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useDataTable } from "./data-table-provider";
import { FieldType } from "./types";

export function DataTableGroupButtons() {
  "use no memo"
  const { table, grouping } = useDataTable();

  // Filter columns that are dimensions and can be grouped
  const groupableColumns = React.useMemo(() => {
    return table.getVisibleFlatColumns().filter(column => {
      // Only allow dimension fields to be grouped
      const fieldType = column.columnDef.meta?.fieldType as FieldType | undefined;
      return column.getCanGroup() && fieldType === 'dimension';
    });
  }, [table]);

  // If no groupable columns, don't render the component
  if (groupableColumns.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-muted-foreground">Row Group by</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {groupableColumns.map(column => {
          // Get a display name for the column
          const columnTitle = typeof column.columnDef.header === 'string' 
            ? column.columnDef.header 
            : column.id;

          return (
            <Button
              key={column.id}
              variant={grouping.includes(column.id) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                column.getToggleGroupingHandler()();
              }}
            >
              {columnTitle}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
