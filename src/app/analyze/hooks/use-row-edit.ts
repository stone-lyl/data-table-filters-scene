import React, { useState } from "react";
import { ColumnSchema } from "../types/types";
import { RowEventHandlersFn } from "../types/event-handlers";

export interface UseRowEditOptions<TData> {
  data: TData[];
  onDataChange?: (newData: TData[]) => void;
}

export interface UseRowEditReturn<TData> {
  selectedRow: TData | null;
  isModalOpen: boolean;
  handleRowUpdate: (updatedData: TData) => void;
  handleRowDelete: (rowToDelete: TData) => void;
  rowEventHandlers: RowEventHandlersFn<TData>;
  openModal: (row: TData) => void;
  closeModal: () => void;
}

export function useRowEdit<TData>({ data, onDataChange }: UseRowEditOptions<TData>): UseRowEditReturn<TData> {
  // State for row edit modal
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle row updates
  const handleRowUpdate = (updatedData: TData) => {
    const newData = data.map(row => 
      (row as ColumnSchema).id === (updatedData as ColumnSchema).id ? updatedData : row
    );
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // Handle row deletion
  const handleRowDelete = (rowToDelete: TData) => {
    const newData = data.filter(row => 
      (row as ColumnSchema).id !== (rowToDelete as ColumnSchema).id
    );
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // Row event handlers
  const rowEventHandlers: RowEventHandlersFn<TData> = (row, rowIndex) => {
    return {
      onDoubleClick: (e: React.MouseEvent) => {
        setSelectedRow(row.original as TData);
        setIsModalOpen(true);
      },
      onClick: (e: React.MouseEvent) => { },
      onContextMenu: (e: React.MouseEvent) => { },
      onMouseEnter: (e: React.MouseEvent) => { },
      onMouseLeave: (e: React.MouseEvent) => { },
    };
  };

  const openModal = (row: TData) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    selectedRow,
    isModalOpen,
    handleRowUpdate,
    handleRowDelete,
    rowEventHandlers,
    openModal,
    closeModal
  };
}
