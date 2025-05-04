"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { UseColumnTooltipReturn } from "./hooks/use-column-tooltip";
import { ColumnSchema } from "./types";

export interface ColumnInfoTooltipProps {
  columnTooltip: UseColumnTooltipReturn<ColumnSchema, unknown>;
}

export function ColumnInfoTooltip({
  columnTooltip,
}: ColumnInfoTooltipProps) {
  const {
    tooltipInfo,
    tooltipPosition,
    isTooltipOpen,
    closeTooltip
  } = columnTooltip;

  if (!tooltipInfo) return <></>;

  const { colIndex } = tooltipInfo;

  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={closeTooltip}>
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
