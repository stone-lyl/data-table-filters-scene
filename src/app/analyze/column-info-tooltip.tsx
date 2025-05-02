"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";
import { useColumnTooltip } from "./hooks/use-column-tooltip";

export interface ColumnInfoTooltipProps {
  children?: ReactNode;
}

export function ColumnInfoTooltip({
  children,
}: ColumnInfoTooltipProps) {
  const {
    tooltipInfo,
    tooltipPosition,
    isTooltipOpen,
    closeTooltip
  } = useColumnTooltip();

  if (!tooltipInfo) return <>{children}</>;

  const { colIndex } = tooltipInfo;

  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={closeTooltip}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          style={{
            position: "absolute",
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
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
