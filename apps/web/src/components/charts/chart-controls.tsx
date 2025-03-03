import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaximizeIcon, RefreshCcwIcon } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { DateRangeSelector } from "./date-range-selector";
import { FilterButton } from "./filter-button";
import { FilterPopoverContent } from "./filter-popover-content";
import { GroupByDropdown } from "./group-by-dropdown";

interface ChartControlsProps {
    onRefresh: () => void;
    groupBy: string;
    setGroupBy: (value: string) => void;
    dateRange: {
        from: string;
        to: string;
    };
    onDateChange: (field: "from" | "to", value: string) => void;
    groupByOptions: Array<{ label: string; value: string }>;
    dateRangeSummary: string;
    containerElement: HTMLElement | null;
}

export function ChartControls({
    onRefresh,
    groupBy,
    setGroupBy,
    dateRange,
    onDateChange,
    groupByOptions,
    dateRangeSummary,
    containerElement
}: ChartControlsProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    
    // Track fullscreen state using useEffect with proper cleanup
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
            // Close popover when entering/exiting fullscreen
            setIsPopoverOpen(false);
        };
        
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);
    
    // Use useCallback for stable function references
    const handlePopoverToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPopoverOpen(!isPopoverOpen);
    }, [isPopoverOpen]);
    
    // Handle closing the popover
    const handleClosePopover = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        setIsPopoverOpen(false);
        // Trigger refetch when popover is closed
        onRefresh();
    }, [onRefresh]);
    
    // Handle popover state change in normal mode
    const handleNormalModePopoverChange = useCallback((open: boolean) => {
        // When closing the popover, refetch the data
        if (!open && isPopoverOpen) {
            onRefresh();
        }
        setIsPopoverOpen(open);
    }, [isPopoverOpen, onRefresh]);
    
    return (
        <div className="flex flex-col w-full mb-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FullScreenButton 
                        containerElement={containerElement} 
                        isFullScreen={isFullScreen}
                    />
                    <RefreshButton onRefresh={onRefresh} />
                </div>
                <div className="text-sm text-muted-foreground">
                    {dateRangeSummary}
                </div>
                <div className="flex items-center gap-2">
                    {isFullScreen ? (
                        <>
                            <FilterButton 
                                onClick={handlePopoverToggle} 
                                isOpen={isPopoverOpen}
                                summary={dateRangeSummary}
                            />
                            {isPopoverOpen && (
                                <div 
                                    className="fixed inset-0 bg-black/50 z-[9999] flex justify-end items-start p-4"
                                    onClick={handleClosePopover}
                                >
                                    <FilterPopoverContent
                                        groupBy={groupBy}
                                        setGroupBy={setGroupBy}
                                        dateRange={dateRange}
                                        onDateChange={onDateChange}
                                        groupByOptions={groupByOptions}
                                        onClose={handleClosePopover}
                                        isFullScreen={true}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <Popover open={isPopoverOpen} onOpenChange={handleNormalModePopoverChange}>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-8 px-2 lg:px-3"
                                    aria-expanded={isPopoverOpen}
                                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setIsPopoverOpen(!isPopoverOpen);
                                        }
                                    }}
                                >
                                    <FilterButton 
                                        isOpen={isPopoverOpen}
                                        summary={dateRangeSummary}
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="w-80 p-0 z-[9999]" 
                                align="end"
                                sideOffset={5}
                            >
                                <div className="p-4 space-y-4">
                                    <h4 className="font-medium">Chart Settings</h4>
                                    <DateRangeSelector 
                                        dateRange={dateRange}
                                        onDateChange={onDateChange}
                                    />
                                    <div className="space-y-2">
                                        <Select value={groupBy} onValueChange={setGroupBy}>
                                            <SelectTrigger id="group-by">
                                                <SelectValue placeholder="Select grouping" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groupByOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    );
}

interface FullScreenButtonProps {
    containerElement: HTMLElement | null;
    isFullScreen: boolean;
}

// Use memo to prevent unnecessary re-renders
export const FullScreenButton = memo(function FullScreenButton({ 
    containerElement, 
    isFullScreen 
}: FullScreenButtonProps) {
    // Use useCallback for stable function reference
    const toggleFullScreen = useCallback(() => {
        if (containerElement) {
            if (!document.fullscreenElement) {
                containerElement.requestFullscreen().catch((err) => {
                    console.error(
                        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
                    );
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    }, [containerElement]);

    return (
        <Button variant="outline" size="sm" onClick={toggleFullScreen}>
            <MaximizeIcon className="h-4 w-4 mr-2" />
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </Button>
    );
});

interface RefreshButtonProps {
    onRefresh: () => void;
}

// Use memo to prevent unnecessary re-renders
export const RefreshButton = memo(function RefreshButton({ 
    onRefresh 
}: RefreshButtonProps) {
    return (
        <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCcwIcon className="h-4 w-4 mr-2" />
            Refresh
        </Button>
    );
}); 