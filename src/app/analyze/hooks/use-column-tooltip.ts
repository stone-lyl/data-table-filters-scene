import { useState } from "react";
import { ColumnDef, Header } from "@tanstack/react-table";

interface UseColumnTooltipReturn<TData, TValue> {
  tooltipInfo: { columns: ColumnDef<TData, TValue>[]; colIndex: number } | null;
  tooltipPosition: { x: number; y: number };
  isTooltipOpen: boolean;
  headerRowEventHandlers: (columns: Header<TData, unknown>[], index: number) => {
    onClick: (e: React.MouseEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  closeTooltip: () => void;
}

export function useColumnTooltip<TData, TValue>(): UseColumnTooltipReturn<TData, TValue> {
  // State for column info tooltip
  const [tooltipInfo, setTooltipInfo] = useState<{ columns: ColumnDef<TData, TValue>[]; colIndex: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Header row event handlers
  const headerRowEventHandlers = (columns: Header<TData, unknown>[], index: number) => {
    return {
      onClick: (e: React.MouseEvent) => { },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
        setTooltipPosition({ x: e.clientX - 10, y: e.clientY - 10 });
        setTooltipInfo({ columns: columns as unknown as ColumnDef<TData, TValue>[], colIndex: index });
        setIsTooltipOpen(true);
      }
    };
  };

  const closeTooltip = () => {
    setIsTooltipOpen(false);
  };

  return {
    tooltipInfo,
    tooltipPosition,
    isTooltipOpen,
    headerRowEventHandlers,
    closeTooltip
  };
}
