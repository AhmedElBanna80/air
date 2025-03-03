import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon, RefreshCcwIcon } from "lucide-react";

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
}

export function ChartControls({
    onRefresh,
    groupBy,
    setGroupBy,
    dateRange,
    onDateChange,
    groupByOptions,
    dateRangeSummary,
}: ChartControlsProps) {
    return (
        <div className="flex flex-col w-full mb-4">
            <div className="flex justify-between items-center">
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
                    />
                    <RefreshButton onRefresh={onRefresh} />
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
}

export function FilterControl({
    groupBy,
    setGroupBy,
    dateRange,
    onDateChange,
    groupByOptions,
}: FilterControlProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
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