import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeSeriesData } from "@/lib/api";
import { ChartControls } from "./chart-controls";

import { useCallback, useEffect, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from "recharts";

// Define colors for each parameter
const COLORS = {
	co: "#8884d8",
	nmhc: "#82ca9d",
	benzene: "#ffc658",
	nox: "#ff8042",
	no2: "#0088fe",
	temperature: "#ff0000",
	relativeHumidity: "#00c0ff",
	absoluteHumidity: "#8800ff",
};

// Group by options
const GROUP_BY_OPTIONS = [
	{ label: "Day", value: "day" },
	{ label: "Week", value: "week" },
	{ label: "Month", value: "month" },
];

type ChartDataPoint = {
	timestamp: string;
	timestampDate: Date; // For sorting
	formattedDate: string; // For display
	[key: string]: string | number | Date;
};

interface AirQualityChartProps {
	data: TimeSeriesData | undefined;
	from: Date;
	to: Date;
	groupBy: string;
	onRefresh: () => void;
	onDateChange: (field: "from" | "to", value: string) => void;
	onGroupByChange: (value: string) => void;
	dateRange: {
		from: string;
		to: string;
	};
	dateRangeSummary: string;
}

export default function AirQualityChart({
	data,
	groupBy,
	onRefresh,
	onDateChange,
	onGroupByChange,
	dateRange,
	dateRangeSummary
}: AirQualityChartProps) {
	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
	const [availableParameters, setAvailableParameters] = useState<string[]>([]);
	const [selectedParameters, setSelectedParameters] = useState<string[]>([
		"co",
		"temperature",
	]);

	// Format date based on groupBy period
	const formatDateByGrouping = useCallback((date: Date): string => {
		switch (groupBy) {
			case "day":
				return date.toLocaleDateString('en-US', { 
					month: 'short', 
					day: 'numeric',
					year: 'numeric'
				});
			case "week":
				return date.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				});
			case "month":
				return date.toLocaleDateString('en-US', { 
					month: 'short', 
					year: 'numeric'
				});
			default:
				return date.toLocaleDateString();
		}
	}, [groupBy]);

	// Process data for the chart
	useEffect(() => {
		if (!data) return;

		// Create a map to hold all data points by timestamp
		const dataByTimestamp = new Map<string, ChartDataPoint>();

		// Get available parameters
		const params: string[] = [
			...data.parameters.map((p: { parameter: { name: string; }; }) => p.parameter.name),
			"temperature",
			"relativeHumidity",
			"absoluteHumidity",
		];
		setAvailableParameters(params);

		// If no parameters are selected, select the first one
		if (selectedParameters.length === 0 && params.length > 0) {
			setSelectedParameters([params[0]]);
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
						formattedDate: formatDateByGrouping(date)
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
						formattedDate: formatDateByGrouping(date)
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
						formattedDate: formatDateByGrouping(date)
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
						formattedDate: formatDateByGrouping(date)
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
			(a, b) => a.timestampDate.getTime() - b.timestampDate.getTime()
		);

		setChartData(processedData);
	}, [data, formatDateByGrouping, selectedParameters]);

	// Handle parameter selection
	const handleParameterChange = (paramName: string) => {
		setSelectedParameters((prev) => {
			if (prev.includes(paramName)) {
				return prev.filter((p) => p !== paramName);
			}
			return [...prev, paramName];
		});
	};

	// Get display name for a parameter
	const getDisplayName = (param: string, includeUnit = false) => {
		// Find parameter metadata
		const parameterMetadata = data?.parameters.find(
			(p: { parameter: { name: string; }; }) => p.parameter.name === param,
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
	};

	// Custom tooltip component
	const CustomTooltip = ({
		active,
		payload,
		label,
	}: TooltipProps<number, string>) => {
		if (active && payload && payload.length) {
			return (
				<Card className="p-3 shadow-md border bg-background">
					<p className="font-medium">{label}</p>
					<div className="mt-2">
						{payload.map((entry) => {
							// Find parameter metadata
							const paramName = entry.dataKey as string;
							const parameterMetadata = data?.parameters.find(
								(p: { parameter: { name: string; }; }) => p.parameter.name === paramName,
							)?.parameter;

							const displayName = parameterMetadata
								? parameterMetadata.display_name
								: paramName === "temperature"
									? "Temperature"
									: paramName === "relativeHumidity"
										? "Relative Humidity"
										: paramName === "absoluteHumidity"
											? "Absolute Humidity"
											: paramName;

							const unit = parameterMetadata
								? parameterMetadata.unit
								: paramName === "temperature"
									? "°C"
									: paramName === "relativeHumidity"
										? "%"
										: paramName === "absoluteHumidity"
											? "g/m³"
											: "";

							return (
								<div
									key={`tooltip-${entry.dataKey}`}
									className="flex items-center py-1"
								>
									<div
										className="w-3 h-3 mr-2"
										style={{ backgroundColor: entry.color }}
									/>
									<span className="text-sm">
										{displayName}:{" "}
										<span className="font-medium">
											{entry.value} {unit}
										</span>
									</span>
								</div>
							);
						})}
					</div>
				</Card>
			);
		}
		return null;
	};

	// Custom Legend Component
	const CustomLegend = () => {
		return (
			<div className="flex flex-wrap gap-3 justify-center mt-2 mb-4">
				{availableParameters.map((param) => {
					const isSelected = selectedParameters.includes(param);
					return (
						<button 
							type="button"
							key={param} 
							className={`flex items-center px-3 py-1.5 rounded-full cursor-pointer transition-all border ${
								isSelected 
									? 'border-transparent bg-sidebar-accent text-sidebar-accent-foreground' 
									: 'border-border bg-background opacity-70'
							}`}
							onClick={() => handleParameterChange(param)}
							aria-pressed={isSelected}
						>
							<div
								className={`w-3 h-3 mr-2 rounded-full ${!isSelected && 'opacity-50'}`}
								style={{
									backgroundColor: COLORS[param as keyof typeof COLORS] || "#000000",
								}}
							/>
							<span className={`text-sm font-medium ${!isSelected && 'opacity-70'}`}>
								{getDisplayName(param)}
							</span>
						</button>
					);
				})}
			</div>
		);
	};

	if (!data) {
		return <div>No data available</div>;
	}

	return (
		<div className="w-full h-full flex flex-col">
			<ChartControls
				onRefresh={onRefresh}
				groupBy={groupBy}
				setGroupBy={onGroupByChange}
				dateRange={dateRange}
				onDateChange={onDateChange}
				groupByOptions={GROUP_BY_OPTIONS}
				dateRangeSummary={dateRangeSummary}
			/>
			
			<CustomLegend />
			
			<div className="flex-1 h-full min-h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={chartData}
						margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="formattedDate"
							tick={{ fontSize: 12 }}
							angle={-45}
							textAnchor="end"
							height={60}
						/>
						<YAxis />
						<Tooltip content={<CustomTooltip />} />

						{/* Generate lines for selected parameters */}
						{selectedParameters.map((param) => {
							return (
								<Line
									key={param}
									type="monotone"
									dataKey={param}
									name={getDisplayName(param, true)}
									stroke={COLORS[param as keyof typeof COLORS] || "#000000"}
									activeDot={{ r: 8 }}
									dot={false}
								/>
							);
						})}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
