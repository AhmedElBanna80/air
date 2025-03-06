import { useTimeSeriesData } from "@/lib/queries/get-charts-data";
import { useStore } from "@tanstack/react-store";
import { useCallback, useMemo, useState } from "react";
import { chartFiltersStore } from "../stores/chart-filters-store";

// Type definitions
export type ChartDataPoint = {
	timestamp: string;
	timestampDate: Date; // For sorting
	formattedDate: string; // For display
	[key: string]: string | number | Date;
};

// Date formatting functions
const formatDateDay = (date: Date): string => {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

const formatDateMonth = (date: Date): string => {
	return date.toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
	});
};

export function useChartDataProcessor() {
	const { groupBy } = useStore(chartFiltersStore);
	const { data } = useTimeSeriesData();
	const [selectedParameters, setSelectedParameters] = useState<string[]>([
		"co",
		"temperature",
	]);

	// Format date based on groupBy period using memoized callback
	const formatDateByGrouping = useCallback(
		(date: Date): string => {
			switch (groupBy) {
				case "day":
				case "week":
					return formatDateDay(date);
				case "month":
					return formatDateMonth(date);
				default:
					return date.toLocaleDateString();
			}
		},
		[groupBy],
	);
	// Process data for the chart
	const { chartData, availableParameters } = useMemo((): { chartData: ChartDataPoint[]; availableParameters: string[] } => {
		if (!data) return { chartData: [], availableParameters: [] };

		// Create a map to hold all data points by timestamp
		const dataByTimestamp = new Map<string, ChartDataPoint>();

		const availableParameters: string[] = [
			...data.parameters.map(
				(p: { parameter: { name: string } }) => p.parameter.name,
			),
			"temperature",
			"relativeHumidity",
			"absoluteHumidity",
		];

		// If no parameters are selected, select the first one
		if (selectedParameters.length === 0 && availableParameters.length > 0) {
			setSelectedParameters([availableParameters[0]]);
		}

		// Process parameters
		for (const paramData of data.parameters) {
			const paramName = paramData.parameter.name;

			for (const point of paramData.series) {
				const date = new Date(point.timestamp);
				// Use raw timestamp as key
				const timestamp = date.toISOString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, {
						timestamp,
						timestampDate: date,
						formattedDate: formatDateByGrouping(date),
					});
				}

				const existingPoint = dataByTimestamp.get(timestamp);
				if (existingPoint) {
					existingPoint[paramName] = point.value;
				}
			}
		}

		// Process environmental data
		if (data.environmentalData.temperature.series.length > 0) {
			for (const point of data.environmentalData.temperature.series) {
				const date = new Date(point.timestamp);
				const timestamp = date.toISOString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, {
						timestamp,
						timestampDate: date,
						formattedDate: formatDateByGrouping(date),
					});
				}

				const existingPoint = dataByTimestamp.get(timestamp);
				if (existingPoint) {
					existingPoint.temperature = point.value;
				}
			}
		}

		if (data.environmentalData.relativeHumidity.series.length > 0) {
			for (const point of data.environmentalData.relativeHumidity.series) {
				const date = new Date(point.timestamp);
				const timestamp = date.toISOString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, {
						timestamp,
						timestampDate: date,
						formattedDate: formatDateByGrouping(date),
					});
				}

				const existingPoint = dataByTimestamp.get(timestamp);
				if (existingPoint) {
					existingPoint.relativeHumidity = point.value;
				}
			}
		}

		if (data.environmentalData.absoluteHumidity.series.length > 0) {
			for (const point of data.environmentalData.absoluteHumidity.series) {
				const date = new Date(point.timestamp);
				const timestamp = date.toISOString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, {
						timestamp,
						timestampDate: date,
						formattedDate: formatDateByGrouping(date),
					});
				}

				const existingPoint = dataByTimestamp.get(timestamp);
				if (existingPoint) {
					existingPoint.absoluteHumidity = point.value;
				}
			}
		}

		// Convert map to array and sort by timestamp
		const processedData = Array.from(dataByTimestamp.values()).sort(
			(a, b) => a.timestampDate.getTime() - b.timestampDate.getTime(),
		);

		return { chartData: processedData, availableParameters };
	}, [data, selectedParameters, formatDateByGrouping]);
	// Handle parameter selection
	const handleParameterChange = useCallback((paramName: string) => {
		setSelectedParameters((prev) => {
			if (prev.includes(paramName)) {
				return prev.filter((p) => p !== paramName);
			}
			return [...prev, paramName];
		});
	}, []);

	// Get display name for a parameter
	const getDisplayName = useCallback((param: string, includeUnit = false) => {
		// Find parameter metadata
		const parameterMetadata = data?.parameters.find(
			(p: { parameter: { name: string } }) => p.parameter.name === param,
		)?.parameter;

		if (includeUnit) {
			return parameterMetadata
				? `${parameterMetadata.display_name} (${parameterMetadata.unit})`
				: param === "temperature"
					? "Temperature (°C)"
					: param === "relativeHumidity"
						? "Relative Humidity (%)"
						: param === "absoluteHumidity"
							? "Absolute Humidity (g/m³)"
							: param;
		}

		return parameterMetadata
			? parameterMetadata.display_name
			: param === "temperature"
				? "Temperature"
				: param === "relativeHumidity"
					? "Relative Humidity"
					: param === "absoluteHumidity"
						? "Absolute Humidity"
						: param;
	}, [data]);

	return {
		chartData,
		rawData: data,
		availableParameters,
		selectedParameters,
		handleParameterChange,
		getDisplayName,
	};
}
