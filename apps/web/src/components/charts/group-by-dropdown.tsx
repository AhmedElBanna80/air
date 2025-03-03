import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useState, useCallback, memo } from "react";

interface GroupByOption {
  label: string;
  value: string;
}

interface GroupByDropdownProps {
  groupBy: string;
  options: GroupByOption[];
  onChange: (value: string) => void;
  isFullScreen?: boolean;
}

function GroupByDropdownComponent({
  groupBy,
  options,
  onChange,
  isFullScreen = false
}: GroupByDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use stable callback for handling selection
  const handleSelection = useCallback((value: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onChange(value);
    setIsOpen(false);
  }, [onChange]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, value?: string) => {
    e.stopPropagation();
    
    // Toggle dropdown on Enter or Space
    if ((e.key === 'Enter' || e.key === ' ') && !value) {
      e.preventDefault();
      setIsOpen(!isOpen);
      return;
    }
    
    // Select option on Enter or Space when value is provided
    if ((e.key === 'Enter' || e.key === ' ') && value) {
      e.preventDefault();
      handleSelection(value, e);
      return;
    }
    
    // Close dropdown on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  }, [isOpen, handleSelection]);

  // Generate ID based on fullscreen mode
  const id = isFullScreen ? "fullscreen-group-by" : "group-by";
  
  // Find selected option label
  const selectedLabel = options.find(option => option.value === groupBy)?.label || "Select grouping";

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Group By</Label>
      
      <div className="relative">
        <Button
          variant="outline"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="w-full justify-between"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          onKeyDown={(e) => handleKeyDown(e)}
        >
          {selectedLabel}
        </Button>
        
        {isOpen && (
          <select
            className="absolute top-full left-0 z-[10000] w-full bg-white dark:bg-gray-950 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 mt-1 py-1 max-h-60 overflow-auto"
            size={options.length}
            value={groupBy}
            onChange={(e) => {
              const value = e.target.value;
              onChange(value);
              setIsOpen(false);
            }}
            onBlur={() => setIsOpen(false)}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                selected={option.value === groupBy}
              >
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const GroupByDropdown = memo(GroupByDropdownComponent); 