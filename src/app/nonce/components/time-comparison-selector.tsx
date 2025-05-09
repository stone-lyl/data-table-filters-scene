'use client';

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ComparisonOption = {
  id: string;
  name: string;
  value: string;
  dateAdd: string;
};

interface TimeComparisonSelectorProps {
  onSelect: (option: ComparisonOption | null) => void;
  selectedOption: ComparisonOption | null;
}
     
const timeComparisonOptions: ComparisonOption[] = [
  { id: 'previous_year', name: 'Previous Year', value: 'year', dateAdd: 'INTERVAL 1 YEAR' },
  { id: 'previous_30_days', name: 'Previous 30 Days', value: '30days', dateAdd: 'INTERVAL 30 DAY' },
  { id: 'previous_7_days', name: 'Previous 7 Days', value: '7days', dateAdd: 'INTERVAL 7 DAY' }
];
  
export function TimeComparisonSelector({
  onSelect,
  selectedOption
}: TimeComparisonSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Compare with</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedOption ? selectedOption.name : "Select comparison period..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search comparison period..." />
            <CommandEmpty>No comparison period found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="text-sm"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedOption === null ? "opacity-100" : "opacity-0"
                  )}
                />
                None
              </CommandItem>
              {timeComparisonOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOption?.id === option.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
