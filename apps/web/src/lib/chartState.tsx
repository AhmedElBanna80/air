import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTimeSeriesData } from "./api";
import type { TimeSeriesData } from "./api";

// Define options outside to prevent recreation
const GROUP_BY_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

// Helper functions
const calculateDateRange = (customFromDate: string, customToDate: string) => {
  return {
    from: new Date(customFromDate),
    to: new Date(customToDate),
  };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Define initial state
const today = new Date();
const defaultStartDate = new Date("2001-01-01");
const initialFromDate = defaultStartDate.toISOString().split("T")[0];
const initialToDate = today.toISOString().split("T")[0];

// Chart state key for React Query
export const CHART_STATE_KEY = 'chartState';

// Chart state interface
interface ChartState {
  groupBy: string;
  customRange: {
    from: string;
    to: string;
  };
  isFullScreen: boolean;
  isPopoverOpen: boolean;
  needsRefresh: boolean;
}

// Initial state
const initialState: ChartState = {
  groupBy: "day",
  customRange: {
    from: initialFromDate,
    to: initialToDate,
  },
  isFullScreen: false,
  isPopoverOpen: false,
  needsRefresh: false,
};

// Base hook for chart state
export function useChartState() {
  const queryClient = useQueryClient();
  
  // Use React Query to manage local state
  const { data = initialState } = useQuery({
    queryKey: [CHART_STATE_KEY],
    queryFn: () => initialState,
    staleTime: Number.POSITIVE_INFINITY, // Never considered stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  
  // Update state function
  const updateChartState = useCallback((updates: Partial<ChartState>) => {
    queryClient.setQueryData([CHART_STATE_KEY], (old: ChartState | undefined) => ({
      ...(old || initialState),
      ...updates
    }));
  }, [queryClient]);
  
  return { 
    chartState: data, 
    updateChartState 
  };
}

// Main hook for chart data and functionality
export function useChartData() {
  const { chartState, updateChartState } = useChartState();
  const { 
    groupBy, 
    customRange, 
    isFullScreen, 
    isPopoverOpen,
    needsRefresh
  } = chartState;
  
  // Calculate date range
  const dateRange = useMemo(
    () => calculateDateRange(customRange.from, customRange.to),
    [customRange.from, customRange.to]
  );

  // Setup query parameters with memoization
  const queryParams = useMemo(
    () => ({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
      groupBy,
    }),
    [dateRange.from, dateRange.to, groupBy]
  );

  // Use a stable reference key for the query that doesn't change with filter parameters
  // This prevents automatic refetching when filters change
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["timeSeriesData"],
    queryFn: () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Query function executing with:", queryParams);
      }
      return fetchTimeSeriesData(dateRange.from, dateRange.to, groupBy);
    },
    retry: 1,
    staleTime: Number.POSITIVE_INFINITY, // Never considered stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: false, // Don't run query automatically
  });

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Time series data loading status:", { isLoading, isError, error });
      if (data) {
        console.log("Time series data loaded:", data);
      }
    }
  }, [data, isLoading, isError, error]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullScreenChange = () => {
      updateChartState({
        isFullScreen: !!document.fullscreenElement,
        isPopoverOpen: false, // Close popover when entering/exiting fullscreen
      });
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [updateChartState]);

  // Callbacks for state updates
  const handleCustomDateChange = useCallback(
    (field: "from" | "to", value: string) => {
      // Only update if value has actually changed
      if (customRange[field] !== value) {
        updateChartState({
          customRange: {
            ...customRange,
            [field]: value,
          },
          needsRefresh: true // Set flag to indicate changes need refreshing
        });
      }
    },
    [customRange, updateChartState]
  );

  const handlePopoverOpenChange = useCallback(
    (open: boolean) => {
      updateChartState({ isPopoverOpen: open });
    },
    [updateChartState]
  );

  const handlePopoverToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateChartState({ isPopoverOpen: !isPopoverOpen });
    },
    [isPopoverOpen, updateChartState]
  );

  const handleClosePopover = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      updateChartState({ isPopoverOpen: false });
      // Don't automatically refetch
    },
    [updateChartState]
  );

  const handleRefresh = useCallback(() => {
    refetch().then(() => {
      // After successful refresh, clear the needsRefresh flag
      updateChartState({ needsRefresh: false });
    });
  }, [refetch, updateChartState]);

  const handleGroupByChange = useCallback(
    (value: string) => {
      updateChartState({ 
        groupBy: value,
        needsRefresh: true // Set flag to indicate changes need refreshing
      });
    },
    [updateChartState]
  );

  const toggleFullScreen = useCallback(
    (containerElement: HTMLElement | null) => {
      if (containerElement) {
        if (!document.fullscreenElement) {
          containerElement.requestFullscreen().catch((err) => {
            console.error(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            );
          });
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },
    []
  );

  // Format date range for display
  const formatDateRangeDisplay = useCallback(() => {
    const fromDate = formatDate(customRange.from);
    const toDate = formatDate(customRange.to);
    return `${fromDate} to ${toDate}`;
  }, [customRange.from, customRange.to]);

  // Date range summary for display
  const dateRangeSummary = useMemo(() => {
    const groupByLabel = GROUP_BY_OPTIONS.find((g) => g.value === groupBy)?.label || groupBy;
    return `${formatDateRangeDisplay()} • ${groupByLabel}`;
  }, [formatDateRangeDisplay, groupBy]);

  return {
    // State
    groupBy,
    customRange,
    dateRange,
    isFullScreen,
    isPopoverOpen,
    needsRefresh,
    // Query results
    data,
    isLoading,
    isError,
    // Derived values
    dateRangeSummary,
    groupByOptions: GROUP_BY_OPTIONS,
    // Callbacks
    handleCustomDateChange,
    handlePopoverOpenChange,
    handleRefresh,
    handleGroupByChange,
    handlePopoverToggle,
    handleClosePopover,
    toggleFullScreen,
  };
} 