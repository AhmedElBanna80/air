import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { memo, useCallback } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { DateRangeSelector } from "./date-range-selector";
import { GroupByDropdown } from "./group-by-dropdown";

interface FilterPopoverContentProps {
  groupBy: string;
  setGroupBy: (value: string) => void;
  dateRange: {
    from: string;
    to: string;
  };
  onDateChange: (field: "from" | "to", value: string) => void;
  groupByOptions: Array<{ label: string; value: string }>;
  onClose: (e: MouseEvent | KeyboardEvent) => void;
  isFullScreen?: boolean;
}

function FilterPopoverContentComponent({
  groupBy,
  setGroupBy,
  dateRange,
  onDateChange,
  groupByOptions,
  onClose,
  isFullScreen = false
}: FilterPopoverContentProps) {
  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      onClose(e);
    }
  }, [onClose]);

  // Handle group by change
  const handleGroupByChange = useCallback((value: string) => {
    setGroupBy(value);
  }, [setGroupBy]);

  // Stop propagation for container click
  const handleContainerClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <dialog 
      className={`
        z-[10000] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in
        ${isFullScreen 
          ? 'w-80 bg-white dark:bg-gray-950 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-right-5 p-0' 
          : 'w-72 p-4'
        }
      `}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-label="Filter settings"
      open
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <h4 className="font-medium leading-none tracking-tight">Filter Chart</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-md" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="grid gap-4 p-4 pt-2">
        <DateRangeSelector 
          dateRange={dateRange}
          onDateChange={onDateChange}
          isFullScreen={isFullScreen}
        />
        <GroupByDropdown
          groupBy={groupBy}
          options={groupByOptions}
          onChange={handleGroupByChange}
          isFullScreen={isFullScreen}
        />
      </div>
    </dialog>
  );
}

// Memoize component to prevent unnecessary re-renders
export const FilterPopoverContent = memo(FilterPopoverContentComponent); 