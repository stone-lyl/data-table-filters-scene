import { useState, useEffect } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { HeaderRowEventHandlersFn } from "../types/event-handlers";
import { toast } from "sonner";
export interface UseColumnTooltipReturn<TData, TValue> {
  headerRowEventHandlers: HeaderRowEventHandlersFn<TData>;
}


export function useColumnTooltip<TData, TValue>(): UseColumnTooltipReturn<TData, TValue> {
  const [tooltipInfo, setTooltipInfo] = useState<{ columns: ColumnDef<TData, TValue>[]; colIndex: number } | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Show notification when tooltip opens with column IDs
  useEffect(() => {
    if (tooltipInfo && isTooltipOpen) {
      toast.info(`Column index: ${tooltipInfo.colIndex}`);
      setIsTooltipOpen(false);
    }
  }, [isTooltipOpen, tooltipInfo]);

  // Header row event handlers
  const headerRowEventHandlers: HeaderRowEventHandlersFn<TData> = (columns, index) => {
    return {
      onClick: (e: React.MouseEvent) => { },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
        setTooltipInfo({ columns: columns as unknown as ColumnDef<TData, TValue>[], colIndex: index });
        setIsTooltipOpen(true);
      }
    };
  };

  return {
    headerRowEventHandlers,
  };
}
