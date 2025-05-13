"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { tagColor } from "@/constants/tag";
import { isArrayOfDates, isArrayOfNumbers } from "@/lib/is-array";
import type { ColumnDef } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Check, Minus } from "lucide-react";
import { ProfitDisplay } from "../components/profit-display";
import type { ColumnSchema } from "../types/types";
import { customSum } from "../util/customAggregationFn";
import {
  formatBigNumber,
  formatBtcAmount,
  formatCurrency,
} from "@/lib/format";
import { decimalSortingFn } from "../util/sorting";
import { AGGREGATION_ROW } from "./common";

// Reusable component for empty cells
const EmptyCell = () => <Minus className="h-4 w-4 text-muted-foreground/50" />;

function DefaultMeasureCell({ value }: { value: string }) {
  return (
    <div className="flex items-end">
      <span> { value } </span>
    </div>
  );
}

export const columns: ColumnDef<ColumnSchema>[] = [
  // {
  //   accessorKey: "name",
  //   header: "Name",
  //   enableHiding: false,
  // },
  {
    accessorKey: "firstName",
    meta: {
      fieldType: "dimension",
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
      fieldType: "dimension",
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
      fieldType: "dimension",
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
      fieldType: "dimension",
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
      fieldType: "dimension",
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
      fieldType: "measure",
    },
    aggregationFn: "sum",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="P95" />
    ),
    cell: ({ row }) => {
      let value = row.getValue("p95");
      if (typeof value === "string") {
        value = parseFloat(value);
      }
      if (typeof value === "undefined" || typeof value !== "number") {
        return <EmptyCell />;
      }
      return <DefaultMeasureCell value={`${Math.round(value)} ms`} />;
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
      fieldType: "dimension",
    },
    header: "Active",
    cell: ({ row }) => {
      const value = row.getValue("active");
      if (value) return <Check className="h-4 w-4" />;
      return <EmptyCell />;
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
      fieldType: "dimension",
    },
    header: "Public",
    cell: ({ row }) => {
      const value = row.getValue("public");
      if (value) return <Check className="h-4 w-4" />;
      return <EmptyCell />;
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
      fieldType: "dimension",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("date");

      return (
        <div
          className="min-w-16 text-xs text-muted-foreground"
          suppressHydrationWarning
        >
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
      fieldType: "measure",
    },
    aggregationFn: customSum,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost (USD)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("cost");

      if (typeof value === "undefined") {
        return <EmptyCell />;
      }

      return <DefaultMeasureCell value={`$ ${formatCurrency(value as number)}`} />;
    },
    sortingFn: decimalSortingFn,
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
    accessorKey: "earning",
    meta: {
      fieldType: "measure",
    },
    aggregationFn: customSum,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Earning" />
    ),
    cell: ({ row }) => {
      const earning = row.getValue("earning") as number;
      const cost = row.getValue("cost") as number;
      if (typeof earning === "undefined" || typeof cost === "undefined") {
        return <EmptyCell />;
      }

      const isAggregationRow = row.id.includes(AGGREGATION_ROW);

      if (isAggregationRow) {
        return <DefaultMeasureCell value={`{$ ${formatCurrency(earning)}}`} />;
      }

      return <ProfitDisplay earning={earning} cost={cost} />;
    },
    sortingFn: decimalSortingFn,
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
    accessorKey: "bigNumber",
    meta: {
      fieldType: "measure",
    },
    aggregationFn: customSum,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Big Number" />
    ),
    sortingFn: decimalSortingFn,
    cell: ({ row }) => {
      const value = row.getValue("bigNumber");

      if (typeof value === "undefined") {
        return <EmptyCell />;
      }

      try {
        return <DefaultMeasureCell value={formatBigNumber(value as string)} />;
      } catch (error) {
        return <div className="text-destructive">Invalid number</div>;
      }
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string;
      if (typeof value === "string") return rowValue === value;
      return false;
    },
  },
  {
    accessorKey: "btcAmount",
    meta: {
      fieldType: "measure",
    },
    aggregationFn: customSum,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BTC Amount" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("btcAmount");
      if (typeof value === "undefined") {
        return <EmptyCell />;
      }

      try {
        const formattedBtc = formatBtcAmount(value as string);

        return <DefaultMeasureCell value={`₿ ${formattedBtc}`} />;
      } catch (error) {
        return <div className="text-destructive">Invalid BTC amount</div>;
      }
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string;
      if (typeof value === "string") return rowValue === value;
      return false;
    },
  },
];
