"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { tagColor } from "@/constants/tag";
import { isArrayOfDates, isArrayOfNumbers } from "@/lib/is-array";
import type { ColumnDef } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Check, Minus } from "lucide-react";
import type { ColumnSchema } from "./types";
import Decimal from "decimal.js-light";

export const columns: ColumnDef<ColumnSchema>[] = [
  // {
  //   accessorKey: "name",
  //   header: "Name",
  //   enableHiding: false,
  // },
  {
    accessorKey: "firstName",
    meta: {
      fieldType: 'dimension'
    },
    header: "First Name",
    cell: ({ row }) => {
      const value = row.getValue("firstName");
      return <div>{`${value}`}</div>;
    },
  },
  {
    accessorKey: "lastName",
    meta: {
      fieldType: 'dimension'
    },
    header: "Last Name",
    cell: ({ row }) => {
      const value = row.getValue("lastName");
      return <div>{`${value}`}</div>;
    },
  },
  {
    accessorKey: "url",
    meta: {
      fieldType: 'dimension'
    },
    header: "URL",
    cell: ({ row }) => {
      const value = row.getValue("url");
      return <div className="max-w-[200px] truncate">{`${value}`}</div>;
    },
  },
  {
    accessorKey: "regions",
    meta: {
      fieldType: 'dimension'
    },
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
    meta: {
      fieldType: 'dimension'
    },
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
    meta: {
      fieldType: 'measure'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="P95" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("p95");
      if (typeof value === "undefined" || typeof value !== "number") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return (
        <div>
          <span className="font-mono">{`${Math.round(value)}`}</span> ms
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
    meta: {
      fieldType: 'dimension'
    },
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
    meta: {
      fieldType: 'dimension'
    },
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
    meta: {
      fieldType: 'dimension'
    },
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
    meta: {
      fieldType: 'measure'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost (USD)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("cost");
      
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }

      // Format value with k/M suffix for large numbers
      const formatCurrency = (value: number) => {
        // Use decimal.js-light for precise calculations
        const decimalValue = new Decimal(value);
        
        if (decimalValue.greaterThanOrEqualTo(1000000)) {
          // For values >= 1M, show as 1.34M
          return `$${decimalValue.dividedBy(1000000).toFixed(2)}M`;
        } else if (decimalValue.greaterThanOrEqualTo(1000)) {
          // For values >= 1k, show as 1.34k
          return `$${decimalValue.dividedBy(1000).toFixed(2)}k`;
        } else {
          // For smaller values, show regular currency format
          return `$${decimalValue.toFixed(2)}`;
        }
      };

      return (
        <div className="flex items-center">
          <span className="font-mono font-medium">
            {formatCurrency(value as number)}
          </span>
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
    enableGrouping: true,
  },
  {
    accessorKey: "bigNumber",
    meta: {
      fieldType: 'measure'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Big Number" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("bigNumber");
      
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }

      try {
        // Use decimal.js-light for big number calculations
        const bigNum = new Decimal(value as string);
        
        // Calculate double the value to demonstrate decimal.js-light calculations
        const doubled = bigNum.times(2);
        
        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs truncate">{value as string}</span>
          </div>
        );
      } catch (error) {
        return <div className="text-destructive">Invalid number</div>;
      }
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string;
      if (typeof value === "string") return rowValue === value;
      return false;
    },
    enableGrouping: true,
  },
  {
    accessorKey: "btcAmount",
    meta: {
      fieldType: 'measure'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BTC Amount" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("btcAmount");
      
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }

      try {
        // Use decimal.js-light for precise decimal calculations
        const btcAmount = new Decimal(value as string);
        
        // Format with exactly 4 decimal places
        const formattedBtc = btcAmount.toFixed(4);
        
        return (
          <div className="flex flex-col">
            <span className="font-mono font-medium">
              ₿{formattedBtc}
            </span>
          </div>
        );
      } catch (error) {
        return <div className="text-destructive">Invalid BTC amount</div>;
      }
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string;
      if (typeof value === "string") return rowValue === value;
      return false;
    },
    enableGrouping: true,
  },
];
