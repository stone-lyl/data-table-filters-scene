"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ColumnSchema } from "./types";

interface RowEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: ColumnSchema | null;
  onSave: (updatedData: ColumnSchema) => void;
  onDelete: (rowData: ColumnSchema) => void;
}

export function RowEditModal({
  isOpen,
  onClose,
  rowData,
  onSave,
  onDelete,
}: RowEditModalProps) {
  const [formData, setFormData] = useState<ColumnSchema | null>(null);

  // Initialize form data when rowData changes
  useState(() => {
    if (rowData) {
      setFormData({ ...rowData });
    }
  });

  if (!rowData || !formData) {
    return null;
  }

  const handleInputChange = (field: keyof ColumnSchema, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    onDelete(rowData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Row Data</DialogTitle>
          <DialogDescription>
            Make changes to the row data or delete it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              First Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              Cost
            </Label>
            <Input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={(e) => handleInputChange("cost", Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="earning" className="text-right">
              Earning
            </Label>
            <Input
              id="earning"
              type="number"
              value={formData.earning}
              onChange={(e) => handleInputChange("earning", Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
