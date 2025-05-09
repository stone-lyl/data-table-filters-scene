'use client';

import { useState } from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  initialDateRange?: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export function DateRangePicker({ 
  initialDateRange, 
  onDateRangeChange 
}: DateRangePickerProps) {
  // Initialize date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange || {
      from: subDays(new Date(), 30),
      to: new Date()
    }
  );

  // Handle date range selection
  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onDateRangeChange(range);
    }
  };

  // Handle preset date range selection
  const selectPresetRange = (range: DateRange) => {
    setDateRange(range);
    onDateRangeChange(range);
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => {
            const today = new Date();
            const last7Days = {
              from: subDays(today, 7),
              to: today
            };
            selectPresetRange(last7Days);
          }}
        >
          Last 7 days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => {
            const today = new Date();
            const last30Days = {
              from: subDays(today, 30),
              to: today
            };
            selectPresetRange(last30Days);
          }}
        >
          Last 30 days
        </Button>
      </div>
    </div>
  );
}
