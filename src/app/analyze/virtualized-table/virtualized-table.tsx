"use client";

import { VirtualizedTableBody } from "@/app/analyze/virtualized-table/virtualized-table-body";
import { VirtualizedTableHeader } from "@/app/analyze/virtualized-table/virtualized-table-header";
import { TableContainer } from "@/components/custom/table";
import { useDataTable } from "@/components/data-table/data-table-provider";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import {
  HeaderRowEventHandlersFn,
  RowEventHandlersFn,
} from "../types/event-handlers";
import { DataTableFooter } from "./virtualized-table-footer";

interface TableRenderProps<TData> {
  onRow?: RowEventHandlersFn<TData>;
  onHeaderRow?: HeaderRowEventHandlersFn<TData>;
  tableClassName?: string;
}

const MaxColumnWidth = 400;
const FontSize = 8;
export function TableRender<TData>({
  onRow,
  onHeaderRow,
  tableClassName,
}: TableRenderProps<TData>) {
  const { table } = useDataTable();
  const visibleColumns = table.getVisibleLeafColumns();

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const columnVirtualizer = useVirtualizer({
    count: visibleColumns.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: (index) => {
      const column = visibleColumns[index];
      const width = column.id.length * FontSize;
      const size = Math.max(width, 150, column?.getSize());
      return Math.min(size, MaxColumnWidth);
    },
    horizontal: true,
    overscan: 2,
  });

  const virtualColumns = columnVirtualizer.getVirtualItems();

  //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
  const virtualPadding = React.useMemo(() => {
    let left: number | null = null;
    let right: number | null = null;

    if (columnVirtualizer && virtualColumns?.length) {
      left = virtualColumns[0]?.start ?? null;
      right =
        columnVirtualizer.getTotalSize() -
        (virtualColumns[virtualColumns.length - 1]?.end ?? null);
    }

    return { left, right };
  }, [columnVirtualizer, virtualColumns]);

  return (
    <TableContainer
      data-testid="analytics-table-main"
      ref={tableContainerRef}
      className={cn(
        tableClassName,
        "relative grid w-full table-fixed border-separate border-spacing-0",
      )}
      containerClassName="rounded-md border"
    >
      <VirtualizedTableHeader
        virtualColumns={virtualColumns}
        virtualPadding={virtualPadding}
        onHeaderRow={onHeaderRow}
      />
      <VirtualizedTableBody
        virtualColumns={virtualColumns}
        virtualPadding={virtualPadding}
        onRow={onRow}
      />
      <DataTableFooter
        virtualColumns={virtualColumns}
        virtualPadding={virtualPadding}
        data-testid="data-table-footer"
      />
    </TableContainer>
  );
}
