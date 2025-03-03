import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface DateRangeSelectorProps {
  dateRange: {
    from: string;
    to: string;
  };
  onDateChange: (field: "from" | "to", value: string) => void;
  isFullScreen?: boolean;
}

export function DateRangeSelector({ 
  dateRange, 
  onDateChange, 
  isFullScreen = false 
}: DateRangeSelectorProps) {
  // Event handler to stop propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Event handler for input change with propagation stopping
  const handleChange = (field: "from" | "to", e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onDateChange(field, e.target.value);
  };

  // Generate unique IDs based on whether we're in fullscreen mode
  const fromId = isFullScreen ? "fullscreen-date-from" : "date-from";
  const toId = isFullScreen ? "fullscreen-date-to" : "date-to";

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={fromId}>From</Label>
        <Input
          id={fromId}
          type="date"
          value={dateRange.from}
          onClick={handleClick}
          onChange={(e) => handleChange("from", e)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={toId}>To</Label>
        <Input
          id={toId}
          type="date"
          value={dateRange.to}
          onClick={handleClick}
          onChange={(e) => handleChange("to", e)}
        />
      </div>
    </>
  );
} 