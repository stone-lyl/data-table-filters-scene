import { Row, Header } from "@tanstack/react-table";

/**
 * Type definition for row event handlers used in data tables
 */
export interface RowEventHandlers {
  onDoubleClick: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}

/**
 * Type for a function that generates row event handlers
 */
export type RowEventHandlersFn<TData> = (row: Row<TData>, rowIndex: number) => RowEventHandlers;

/**
 * Type definition for header row event handlers
 */
export interface HeaderRowEventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

/**
 * Type for a function that generates header row event handlers
 */
export type HeaderRowEventHandlersFn<TData> = (columns: Header<TData, unknown>[], index: number) => HeaderRowEventHandlers;
