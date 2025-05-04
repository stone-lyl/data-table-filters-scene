"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useDataTable } from "./data-table-provider";
import { FieldType } from "./types";

export function DataTableGroupButtons() {
  const { table, grouping, columnVisibility } = useDataTable();

  // Filter columns that are dimensions and can be grouped
  const groupableColumns = React.useMemo(() => {
    return table.getAllColumns().filter(column => {
      // Only allow dimension fields to be grouped
      const fieldType = column.columnDef.meta?.fieldType as FieldType | undefined;
      return column.getCanGroup() && fieldType === 'dimension' && columnVisibility[column.id];
    });
  }, [table.getAllColumns(), columnVisibility]);

  if (groupableColumns.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row items-center">
      <p className="mr-2 text-muted-foreground text-sm">Row Group</p>
      <div className="flex flex-wrap gap-2">
        {groupableColumns.map(column => {
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
