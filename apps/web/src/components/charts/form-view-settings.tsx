import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChartData } from "@/lib/chartState";
import { MaximizeIcon, RefreshCcwIcon, SearchIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type { KeyboardEvent } from "react";

interface FormViewSettingsProps {
    containerElement: HTMLElement | null;
}

export function FormViewSettings({
    containerElement,
}: FormViewSettingsProps) {
    // Get everything we need from the context
    const {
        groupBy,
        isFullScreen,
        customRange,
        groupByOptions,
        handleRefresh,
        handleGroupByChange,
        handleCustomDateChange,
        needsRefresh,
        toggleFullScreen,
    } = useChartData();

    // Skip updates flag to prevent infinite loops
    const skipNextUpdate = useRef(false);

    // Local state for the date range
    const [fromDate, setFromDate] = useState(
        customRange.from ? new Date(customRange.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    );
    const [toDate, setToDate] = useState(
        customRange.to ? new Date(customRange.to) : new Date(),
    );

    // Sync context state to local state when customRange changes
    useEffect(() => {
        if (!skipNextUpdate.current) {
            // Only update local state if changes are coming from context
            const newFromDate = new Date(customRange.from);
            const newToDate = new Date(customRange.to);
            
            if (newFromDate.getTime() !== fromDate.getTime()) {
                setFromDate(newFromDate);
            }
            
            if (newToDate.getTime() !== toDate.getTime()) {
                setToDate(newToDate);
            }
        } else {
            // Reset the flag
            skipNextUpdate.current = false;
        }
    }, [customRange, fromDate, toDate]);

    // Update the custom range when the dates change
    const handleLocalDateChange = (field: "from" | "to", date: Date) => {
        // Set the flag to prevent the other effect from firing
        skipNextUpdate.current = true;
        
        if (field === "from") {
            setFromDate(date);
        } else {
            setToDate(date);
        }
        
        // Update the context
        handleCustomDateChange(field, date.toISOString().split('T')[0]);
    };

    // Select state
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectedOption = groupBy;

    const onGroupByChange = (value: string) => {
        handleGroupByChange(value);
        setIsSelectOpen(false);
    };

    // Basic keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>, action: () => void) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            action();
        }
    };

    // Render group by selector
    const renderGroupBySelector = () => {
        return (
            <div className="relative">
                <button
                    type="button"
                    id="group-by"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    onKeyDown={(e) => handleKeyDown(e, () => setIsSelectOpen(!isSelectOpen))}
                    aria-expanded={isSelectOpen}
                    aria-haspopup="listbox"
                >
                    <span>
                        {groupByOptions.find((option) => option.value === selectedOption)?.label || "Select..."}
                    </span>
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
                        className="h-4 w-4 opacity-50"
                        aria-hidden="true"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>
                {isSelectOpen && (
                    <select
                        className="absolute right-0 top-full z-[99999] mt-1 min-w-20 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md focus:outline-none select-none"
                        size={Math.min(groupByOptions.length, 4)}
                        value={selectedOption}
                        onChange={(e) => onGroupByChange(e.target.value)}
                        onBlur={() => setIsSelectOpen(false)}
                    >
                        {groupByOptions.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
                                    selectedOption === option.value
                                        ? "bg-accent text-accent-foreground"
                                        : "focus:bg-accent focus:text-accent-foreground"
                                }`}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        );
    };

    // Render refresh button
    const renderRefreshButton = () => {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            className={needsRefresh ? "text-primary bg-primary/10" : ""}
                        >
                            {needsRefresh ? (
                                <SearchIcon className="h-4 w-4" />
                            ) : (
                                <RefreshCcwIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">{needsRefresh ? "Apply Changes" : "Refresh"}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{needsRefresh ? "Apply Changes" : "Refresh"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <div className="mb-4 pb-4 border-b border-border">
            {/* Container with flex instead of grid */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left side - Full Screen button */}
                <div className="flex-shrink-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toggleFullScreen(containerElement)}
                                    className="flex bg-transparent border-none hover:bg-accent hover:text-accent-foreground"
                                >
                                    <MaximizeIcon className="h-4 w-4" />
                                    <span className="sr-only">Full Screen</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Full Screen</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Right side - Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* From date */}
                    <div className="flex items-center gap-1">
                        <label htmlFor="date-from" className="text-sm font-medium whitespace-nowrap">From:</label>
                        <input
                            id="date-from"
                            type="date"
                            value={fromDate.toISOString().split('T')[0]}
                            onChange={(e) => handleLocalDateChange("from", new Date(e.target.value))}
                            className="h-9 rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    
                    {/* To date */}
                    <div className="flex items-center gap-1">
                        <label htmlFor="date-to" className="text-sm font-medium whitespace-nowrap">To:</label>
                        <input
                            id="date-to"
                            type="date"
                            value={toDate.toISOString().split('T')[0]}
                            onChange={(e) => handleLocalDateChange("to", new Date(e.target.value))}
                            className="h-9 rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    
                    {/* Group By selector */}
                    <div className="flex items-center gap-1">
                        <label htmlFor="group-by" className="text-sm font-medium whitespace-nowrap">Group By:</label>
                        {renderGroupBySelector()}
                    </div>
                    
                    {/* Refresh button */}
                    {renderRefreshButton()}
                </div>
            </div>
        </div>
    );
} 