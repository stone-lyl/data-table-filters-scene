"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface ColumnInfoTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  columnInfo: any;
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

  // Extract column information
  const { id, header, accessorKey, meta } = columnInfo.column?.columnDef || {};
  const fieldType = meta?.fieldType || "unknown";

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
          <div className="space-y-2 p-2">
            <div className="font-semibold">{header || accessorKey || id}</div>
            <div className="text-sm">
              <div><span className="text-muted-foreground">ID:</span> {id}</div>
              <div><span className="text-muted-foreground">Type:</span> {fieldType}</div>
              <div><span className="text-muted-foreground">Key:</span> {accessorKey}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
