import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeSeriesData } from "@/lib/api";

import { useEffect, useState } from "react";
import {
	CartesianGrid,
	Legend,
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

type ChartDataPoint = {
	timestamp: string;
	[key: string]: string | number;
};

interface AirQualityChartProps {
	data: TimeSeriesData | undefined;
	from: Date;
	to: Date;
}

export default function AirQualityChart({
	data,
}: AirQualityChartProps) {
	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
	const [availableParameters, setAvailableParameters] = useState<string[]>([]);
	const [selectedParameters, setSelectedParameters] = useState<string[]>([
		"co",
		"temperature",
	]);

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
				// Format timestamp for display
				const timestamp = new Date(point.timestamp).toLocaleString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, { timestamp });
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
				const timestamp = new Date(point.timestamp).toLocaleString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, { timestamp });
				}

				const existingPoint = dataByTimestamp.get(timestamp);
				if (existingPoint) {
					existingPoint.temperature = point.value;
				}
			}
		}
		if (data.environmentalData.relativeHumidity.series.length > 0) {
			for (const point of data.environmentalData.relativeHumidity.series) {
				const timestamp = new Date(point.timestamp).toLocaleString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, { timestamp });
				}

				const existingPoint = dataByTimestamp.get(timestamp);
				if (existingPoint) {
					existingPoint.relativeHumidity = point.value;
				}
			}
		}

		if (data.environmentalData.absoluteHumidity.series.length > 0) {
			for (const point of data.environmentalData.absoluteHumidity.series) {
				const timestamp = new Date(point.timestamp).toLocaleString();

				if (!dataByTimestamp.has(timestamp)) {
					dataByTimestamp.set(timestamp, { timestamp });
				}

				const existingPoint = dataByTimestamp.get(timestamp);
				if (existingPoint) {
					existingPoint.absoluteHumidity = point.value;
				}
			}
		}

		// Convert map to array and sort by timestamp
		const processedData = Array.from(dataByTimestamp.values()).sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);

		setChartData(processedData);
	}, [data, selectedParameters]);

	// Handle parameter selection
	const handleParameterChange = (paramName: string) => {
		setSelectedParameters((prev) => {
			if (prev.includes(paramName)) {
				return prev.filter((p) => p !== paramName);
			}
			return [...prev, paramName];
		});
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
						{payload.map((entry, _index) => {
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

	if (!data) {
		return <div>No data available</div>;
	}

	return (
		<div className="w-full h-full flex flex-col lg:flex-row gap-4">
			<div className="flex-1 h-full min-h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={chartData}
						margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="timestamp"
							tick={{ fontSize: 12 }}
							angle={-45}
							textAnchor="end"
							height={60}
						/>
						<YAxis />
						<Tooltip content={<CustomTooltip />} />
						<Legend />

						{/* Generate lines for selected parameters */}
						{selectedParameters.map((param) => {
							// Find the parameter metadata for the current parameter
							const parameterMetadata = data?.parameters.find(
								(p: { parameter: { name: string; }; }) => p.parameter.name === param,
							)?.parameter;

							const displayName = parameterMetadata
								? `${parameterMetadata.display_name} (${parameterMetadata.unit})`
								: param === "temperature"
									? "Temperature (°C)"
									: param === "relativeHumidity"
										? "Relative Humidity (%)"
										: param === "absoluteHumidity"
											? "Absolute Humidity (g/m³)"
											: param;

							return (
								<Line
									key={param}
									type="monotone"
									dataKey={param}
									name={displayName}
									stroke={COLORS[param as keyof typeof COLORS] || "#000000"}
									activeDot={{ r: 8 }}
									dot={false}
								/>
							);
						})}
					</LineChart>
				</ResponsiveContainer>
			</div>

			<div className="lg:w-60 shrink-0">
				<h3 className="text-lg font-medium mb-3">Parameters</h3>
				<ScrollArea className="h-[calc(100%-2rem)] lg:h-[300px] rounded-md border p-4">
					<div className="space-y-4">
						{availableParameters.map((param) => {
							// Find parameter metadata
							const parameterMetadata = data?.parameters.find(
								(p: { parameter: { name: string; }; }) => p.parameter.name === param,
							)?.parameter;

							const displayName = parameterMetadata
								? parameterMetadata.display_name
								: param === "temperature"
									? "Temperature"
									: param === "relativeHumidity"
										? "Relative Humidity"
										: param === "absoluteHumidity"
											? "Absolute Humidity"
											: param;

							return (
								<div key={param} className="flex items-center space-x-2">
									<Checkbox
										id={`param-${param}`}
										checked={selectedParameters.includes(param)}
										onCheckedChange={() => handleParameterChange(param)}
									/>
									<Label
										htmlFor={`param-${param}`}
										className="flex items-center"
									>
										<div
											className="w-3 h-3 mr-2"
											style={{
												backgroundColor:
													COLORS[param as keyof typeof COLORS] || "#000000",
											}}
										/>
										{displayName}
									</Label>
								</div>
							);
						})}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
