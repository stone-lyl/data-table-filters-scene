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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Row } from "@tanstack/react-table";

interface RowEditModalProps<TData> {
  isOpen: boolean;
  onClose: () => void;
  rowData: TData | null;
  onSave: (updatedData: TData) => void;
  onDelete: (rowData: TData) => void;
}

// Helper function to determine if a field should be editable
const isEditableField = (key: string): boolean => {
  const nonEditableFields = ['id', 'date', 'regions', 'tags', 'bigNumber', 'btcAmount'];
  return !nonEditableFields.includes(key);
};

// Helper function to get field label from camelCase
const getFieldLabel = (key: string): string => {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

export function RowEditModal<TData>({
  isOpen,
  onClose,
  rowData,
  onSave,
  onDelete,
}: RowEditModalProps<TData>) {
  const [formData, setFormData] = useState<TData | null>(rowData as TData | null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (rowData) {
      setFormData({ ...rowData });
    }
  }, [rowData]);

  if (!rowData || !formData) {
    return null;
  }

  const handleInputChange = (field: keyof TData, value: unknown) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDelete = () => {
    onDelete(rowData);
    onClose();
    setShowDeleteConfirm(false);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // Render form fields dynamically based on the data type
  const renderFormFields = () => {
    return Object.entries(formData as Record<string, unknown>)
      .filter(([key]) => isEditableField(key))
      .map(([key, value]) => {
        const fieldKey = key as keyof TData;
        const fieldLabel = getFieldLabel(key);

        // Render different input types based on the value type
        if (typeof value === 'boolean') {
          return (
            <div key={key} className="grid grid-cols-4 items-center gap-4 py-2">
              <Label htmlFor={key} className="text-right">
                {fieldLabel}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id={key}
                  checked={value as boolean}
                  onCheckedChange={(checked: boolean) => handleInputChange(fieldKey, checked)}
                />
                <Label htmlFor={key} className="text-sm font-normal text-muted-foreground">
                  {value ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>
          );
        } else if (typeof value === 'number') {
          return (
            <div key={key} className="grid grid-cols-4 items-center gap-4 py-2">
              <Label htmlFor={key} className="text-right">
                {fieldLabel}
              </Label>
              <Input
                id={key}
                type="number"
                value={value as number}
                onChange={(e) => handleInputChange(fieldKey, parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
          );
        } else {
          // Default to string input
          return (
            <div key={key} className="grid grid-cols-4 items-center gap-4 py-2">
              <Label htmlFor={key} className="text-right">
                {fieldLabel}
              </Label>
              <Input
                id={key}
                value={(value?.toString()) as string}
                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                className="col-span-3"
              />
            </div>
          );
        }
      });
  };

  return (
    <>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone, will permanently delete the data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Row Data</DialogTitle>
            <DialogDescription>
              only some fields are editable
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="grid gap-3 py-4">
              {renderFormFields()}
            </div>
          </div>
          <DialogFooter className="flex items-center sm:justify-between pt-2 border-t">
            <div className="flex space-x-2">
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
