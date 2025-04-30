"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

export interface ColumnInfoTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  columnInfo: { colIndex: number, columns: ColumnDef<unknown, unknown>[] } | null;
  children: ReactNode;
}

export function ColumnInfoTooltip({
  isOpen,
  onClose,
  position,
  columnInfo,
  children,
}: ColumnInfoTooltipProps) {
  if (!columnInfo) return null;

  const { colIndex } = columnInfo;

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={onClose}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          style={{
            position: "absolute",
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          className="z-50"
        >
          <div className="space-y-2 p-2 w-32">
            <div className="text-sm">
              <div><span className="text-muted-foreground">column index:</span> {colIndex}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
