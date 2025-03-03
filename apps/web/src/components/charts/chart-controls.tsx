import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon, MaximizeIcon, RefreshCcwIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";

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
    
    // Track fullscreen state
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);
    
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
                    <FilterControl 
                        groupBy={groupBy}
                        setGroupBy={setGroupBy}
                        dateRange={dateRange}
                        onDateChange={onDateChange}
                        groupByOptions={groupByOptions}
                        isFullScreen={isFullScreen}
                    />
                </div>
            </div>
        </div>
    );
}

interface FilterControlProps {
    groupBy: string;
    setGroupBy: (value: string) => void;
    dateRange: {
        from: string;
        to: string;
    };
    onDateChange: (field: "from" | "to", value: string) => void;
    groupByOptions: Array<{ label: string; value: string }>;
    isFullScreen: boolean;
}

export function FilterControl({
    groupBy,
    setGroupBy,
    dateRange,
    onDateChange,
    groupByOptions,
    isFullScreen
}: FilterControlProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGroupByOpen, setIsGroupByOpen] = useState(false);
    
    // Simple toggle function
    const togglePopover = () => {
        setIsOpen(!isOpen);
    };
    
    // Custom handler for group by selection in fullscreen
    const handleGroupBySelection = (value: string, e: React.MouseEvent | React.KeyboardEvent) => {
        // Stop propagation to prevent closing the fullscreen mode
        e.stopPropagation();
        
        setGroupBy(value);
        setIsGroupByOpen(false);
    };
    
    // Fullscreen-compatible popover implementation
    if (isFullScreen) {
        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setIsGroupByOpen(false);
            }
        };

        // Separate handler for closing the popover only
        const closePopover = (e: React.MouseEvent | React.KeyboardEvent) => {
            e.stopPropagation();
            setIsOpen(false);
            setIsGroupByOpen(false);
        };

        return (
            <>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePopover();
                    }}
                >
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                </Button>
                
                {isOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-[9999] flex justify-end items-start p-4" 
                        onClick={closePopover}
                        onKeyDown={handleKeyDown}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filter settings"
                    >
                        <div 
                            className="w-80 bg-white dark:bg-gray-950 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-right-5 p-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Escape') {
                                    closePopover(e);
                                }
                            }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Chart Settings</h4>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closePopover(e);
                                    }}
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullscreen-date-from">From</Label>
                                    <Input
                                        id="fullscreen-date-from"
                                        type="date"
                                        value={dateRange.from}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onDateChange("from", e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullscreen-date-to">To</Label>
                                    <Input
                                        id="fullscreen-date-to"
                                        type="date"
                                        value={dateRange.to}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onDateChange("to", e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullscreen-group-by">Group By</Label>
                                    
                                    {/* Custom dropdown for fullscreen mode */}
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            aria-haspopup="listbox"
                                            aria-expanded={isGroupByOpen}
                                            className="w-full justify-between"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsGroupByOpen(!isGroupByOpen);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsGroupByOpen(!isGroupByOpen);
                                                }
                                            }}
                                        >
                                            {groupByOptions.find(option => option.value === groupBy)?.label || "Select grouping"}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={`ml-2 h-4 w-4 transition-transform ${isGroupByOpen ? 'rotate-180' : ''}`}
                                                aria-hidden="true"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </Button>
                                        
                                        {isGroupByOpen && (
                                            <div 
                                                className="absolute top-full left-0 z-[10000] w-full bg-white dark:bg-gray-950 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 mt-1 py-1 max-h-60 overflow-auto"
                                                role="listbox"
                                                tabIndex={-1}
                                                aria-label="Group by options"
                                            >
                                                {groupByOptions.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        className={`px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                                                            option.value === groupBy ? 'bg-gray-100 dark:bg-gray-800' : ''
                                                        }`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleGroupBySelection(option.value, e);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleGroupBySelection(option.value, e);
                                                            }
                                                        }}
                                                        role="option"
                                                        aria-selected={option.value === groupBy}
                                                        tabIndex={0}
                                                    >
                                                        {option.label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Regular popover for non-fullscreen mode
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    data-filter-button="true"
                >
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-80 p-4 z-[9999]" 
                align="end"
                sideOffset={5}
            >
                <div className="space-y-4">
                    <h4 className="font-medium">Chart Settings</h4>
                    <div className="space-y-2">
                        <Label htmlFor="date-from">From</Label>
                        <Input
                            id="date-from"
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => onDateChange("from", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date-to">To</Label>
                        <Input
                            id="date-to"
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => onDateChange("to", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="group-by">Group By</Label>
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
    );
}

interface FullScreenButtonProps {
    containerElement: HTMLElement | null;
    isFullScreen: boolean;
}

export function FullScreenButton({ containerElement, isFullScreen }: FullScreenButtonProps) {
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
}

interface RefreshButtonProps {
    onRefresh: () => void;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
    return (
        <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCcwIcon className="h-4 w-4 mr-2" />
            Refresh
        </Button>
    );
} 