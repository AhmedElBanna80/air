import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { fetchTimeSeriesData } from "../api";
import { chartFiltersStore } from "../stores/chart-filters-store";


// Hook for fetching time series data
export function useTimeSeriesData() {
  const { from, to, groupBy } = useStore(chartFiltersStore);
  // The query hook
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["timeSeriesData", from, to, groupBy],
    queryFn: () => {
      return fetchTimeSeriesData(from, to, groupBy);
    },
    retry: 1,
    refetchOnMount: true,
  });

  return { data, isLoading, isError, refetch, error };
} 