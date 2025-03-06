import { Card } from "@/components/ui/card";
import { ChartControls } from "./chart-controls";

import { useIsFullScreen } from "@/lib/hooks/use-is-fullscreen";
import { useChartDataProcessor } from "@/lib/hooks/useChartDataProcessor";
import { useTimeSeriesData } from "@/lib/queries/get-charts-data";
import { memo, useEffect, useRef } from "react";
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

// Define colors for each parameter as a constant outside the component
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

// Main chart component
function AirQualityChartComponent() {
	const { data } = useTimeSeriesData();
	const {
		chartData,
		availableParameters,
		selectedParameters,
		handleParameterChange,
		getDisplayName,
	} = useChartDataProcessor();

	
	// Get the fullscreen handler from the hook
	const { containerElement } = useIsFullScreen();
	

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
								(p: { parameter: { name: string } }) =>
									p.parameter.name === paramName,
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
									? "border-transparent bg-sidebar-accent text-sidebar-accent-foreground"
									: "border-border bg-background opacity-70"
							}`}
							onClick={() => handleParameterChange(param)}
							aria-pressed={isSelected}
						>
							<div
								className={`w-3 h-3 mr-2 rounded-full ${!isSelected && "opacity-50"}`}
								style={{
									backgroundColor:
										COLORS[param as keyof typeof COLORS] || "#000000",
								}}
							/>
							<span
								className={`text-sm font-medium ${!isSelected && "opacity-70"}`}
							>
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
		<div className="w-full h-full flex flex-col" ref={containerElement}>
			<ChartControls />

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

export default memo(AirQualityChartComponent);
