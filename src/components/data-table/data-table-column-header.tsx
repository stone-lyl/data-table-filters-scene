import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> extends ButtonProps {
  column: Column<TData, TValue>;
  title: string;
  align?: 'start' | 'center' | 'end';
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  align = 'start',
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className, `text-${align}`)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        column.toggleSorting(undefined);
      }}
      className={cn(
        "py-0 px-0 h-7 hover:bg-transparent flex gap-2 items-center justify-between w-full",
        className
      )}
      {...props}
    >
      <span className={`w-full text-${align}`}>{title}</span>
      <span className="flex flex-col">
        <ChevronUp
          className={cn(
            "-mb-0.5 h-3 w-3",
            column.getIsSorted() === "asc"
              ? "text-accent-foreground"
              : "text-muted-foreground"
          )}
        />
        <ChevronDown
          className={cn(
            "-mt-0.5 h-3 w-3",
            column.getIsSorted() === "desc"
              ? "text-accent-foreground"
              : "text-muted-foreground"
          )}
        />
      </span>
    </Button>
  );
}
