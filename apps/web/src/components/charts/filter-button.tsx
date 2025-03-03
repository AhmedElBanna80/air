import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";
import { memo } from "react";

interface FilterButtonProps extends Omit<ButtonProps, 'children'> {
  onClick?: (e: React.MouseEvent) => void;
  isOpen: boolean;
  summary?: string;
}

function FilterButtonComponent({
  onClick,
  isOpen,
  summary,
  ...props
}: FilterButtonProps) {
  return (
    <>
      <FilterIcon className="h-4 w-4 mr-2" />
      Filter
      {summary && (
        <span className="hidden md:inline ml-1 text-muted-foreground text-xs truncate max-w-[150px]">
          ({summary})
        </span>
      )}
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const FilterButton = memo(FilterButtonComponent); 