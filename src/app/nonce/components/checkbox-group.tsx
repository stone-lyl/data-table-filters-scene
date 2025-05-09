'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface CheckboxGroupProps {
  title: string;
  items: Array<{ id: string; name: string; }>;
  selectedItems: string[];
  onChange: (selectedIds: string[]) => void;
}

export function CheckboxGroup({ title, items, selectedItems, onChange }: CheckboxGroupProps) {
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedItems, id]);
    } else {
      onChange(selectedItems.filter(item => item !== id));
    }
  };

  return (
    <div className="space-y-1">
      {title && <p className="text-xs text-muted-foreground">{title}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-start space-x-1 pt-1">
          <Checkbox 
            id={item.id} 
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => handleCheckboxChange(item.id, checked === true)}
          />
          <Label htmlFor={item.id} className="text-sm">
            {item.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
