"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { tagColor } from "@/constants/tag";
import { isArrayOfDates, isArrayOfNumbers } from "@/lib/is-array";
import type { ColumnDef } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Check, DollarSign, Minus } from "lucide-react";
import type { ColumnSchema } from "./types";

// Helper function to get unique values from arrays
const getUniqueValues = (values: any[]): string => {
  // Handle arrays of arrays (like regions, tags)
  const flatValues = values.flatMap(v => Array.isArray(v) ? v : [v]);
  const uniqueValues = Array.from(new Set(flatValues));
  return uniqueValues.join(', ');
};

// Helper function to count true values
const countTrueValues = (values: boolean[]): string => {
  const trueCount = values.filter(Boolean).length;
  return `${trueCount}/${values.length}`;
};

// Helper function to calculate average for numeric values
const calculateAverage = (values: number[]): string => {
  const validValues = values.filter(v => typeof v === 'number');
  if (validValues.length === 0) return 'N/A';
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const avg = sum / validValues.length;
  return `${Math.round(avg)} ms (avg)`;
};

export const columns: ColumnDef<ColumnSchema>[] = [
  // {
  //   accessorKey: "name",
  //   header: "Name",
  //   enableHiding: false,
  // },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => {
      const value = row.getValue("firstName");
      return <div>{`${value}`}</div>;
    },
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => {
      const value = row.getValue("lastName");
      return <div>{`${value}`}</div>;
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const value = row.getValue("url");
      return <div className="max-w-[200px] truncate">{`${value}`}</div>;
    },
  },
  {
    accessorKey: "regions",
    header: "Regions",
    cell: ({ row }) => {
      const value = row.getValue("regions");
      if (Array.isArray(value)) {
        return <div className="text-muted-foreground">{value.join(", ")}</div>;
      }
      return <div className="text-muted-foreground">{`${value}`}</div>;
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id) as string[];
      if (typeof value === "string") return array.includes(value);
      // up to the user to define either `.some` or `.every`
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const value = row.getValue("tags") as string | string[];
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <Badge key={v} className={tagColor[v].badge}>
                {v}
              </Badge>
            ))}
          </div>
        );
      }
      return <Badge className={tagColor[value].badge}>{value}</Badge>;
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id) as string[];
      if (typeof value === "string") return array.includes(value);
      // up to the user to define either `.some` or `.every`
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    accessorKey: "p95",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="P95" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("p95");
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return (
        <div>
          <span className="font-mono">{`${value}`}</span> ms
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      if (typeof value === "number") return value === Number(rowValue);
      if (Array.isArray(value) && isArrayOfNumbers(value)) {
        if (value.length === 1) {
          return value[0] === rowValue;
        } else {
          const sorted = value.sort((a, b) => a - b);
          return sorted[0] <= rowValue && rowValue <= sorted[1];
        }
      }
      return false;
    },
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => {
      const value = row.getValue("active");
      if (value) return <Check className="h-4 w-4" />;
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (typeof value === "string") return value === String(rowValue);
      if (typeof value === "boolean") return value === rowValue;
      if (Array.isArray(value)) return value.includes(rowValue);
      return false;
    },
  },
  {
    accessorKey: "public",
    header: "Public",
    cell: ({ row }) => {
      const value = row.getValue("public");
      if (value) return <Check className="h-4 w-4" />;
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (typeof value === "string") return value === String(rowValue);
      if (typeof value === "boolean") return value === rowValue;
      if (Array.isArray(value)) return value.includes(rowValue);
      return false;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("date");

      return (
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
          {format(new Date(`${value}`), "LLL dd, y HH:mm")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (value instanceof Date && rowValue instanceof Date) {
        return isSameDay(value, rowValue);
      }
      if (Array.isArray(value)) {
        if (isArrayOfDates(value) && rowValue instanceof Date) {
          const sorted = value.sort((a, b) => a.getTime() - b.getTime());
          // TODO: check length
          return (
            sorted[0]?.getTime() <= rowValue.getTime() &&
            rowValue.getTime() <= sorted[1]?.getTime()
          );
        }
      }
      return false;
    },
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost (USD)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("cost");
      
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }

      // Format as USD currency
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-emerald-600" />
          <span className="font-mono font-medium">
            {formatter.format(value as number)}
          </span>
        </div>
      );
    },
    aggregationFn: 'sum',
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      if (typeof value === "number") return value === Number(rowValue);
      if (Array.isArray(value) && isArrayOfNumbers(value)) {
        if (value.length === 1) {
          return value[0] === rowValue;
        } else {
          const sorted = value.sort((a, b) => a - b);
          return sorted[0] <= rowValue && rowValue <= sorted[1];
        }
      }
      return false;
    },
    enableGrouping: true,
  },
];
