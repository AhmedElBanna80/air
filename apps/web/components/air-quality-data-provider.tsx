"use client";

import type React from "react";
import type { DateRange } from "react-day-picker";

import { format } from "date-fns";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

import { FilterForm } from "./filter-form";

type Measurement = {
  "timestamp": string;
  "CO(GT)": number;
  "PT08.S1(CO)": number;
  "NMHC(GT)": number;
  "C6H6(GT)": number;
  "PT08.S2(NMHC)": number;
  "NOx(GT)": number;
  "PT08.S3(NOx)": number;
  "NO2(GT)": number;
  "PT08.S4(NO2)": number;
  "PT08.S5(O3)": number;
  "T": number;
  "RH": number;
  "AH": number;
};

type AirQualityChartProps = {
  data: Measurement[];
};

const properties = [
  { key: "CO(GT)", label: "CO (GT)", color: "#ff7f50" },
  { key: "PT08.S1(CO)", label: "CO (S1)", color: "#ff6347" },
  { key: "NMHC(GT)", label: "NMHC (GT)", color: "#40e0d0" },
  { key: "C6H6(GT)", label: "Benzene", color: "#ff00ff" },
  { key: "PT08.S2(NMHC)", label: "NMHC (S2)", color: "#48d1cc" },
  { key: "NOx(GT)", label: "NOx (GT)", color: "#00ffff" },
  { key: "PT08.S3(NOx)", label: "NOx (S3)", color: "#00ced1" },
  { key: "NO2(GT)", label: "NO2 (GT)", color: "#ff8c00" },
  { key: "PT08.S4(NO2)", label: "NO2 (S4)", color: "#ffa500" },
  { key: "PT08.S5(O3)", label: "O3 (S5)", color: "#0088fe" },
  { key: "T", label: "Temperature", color: "#8884d8" },
  { key: "RH", label: "Relative Humidity", color: "#82ca9d" },
  { key: "AH", label: "Absolute Humidity", color: "#ffd700" },
];

export default function AirQualityChart({ data }: AirQualityChartProps) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>(["T", "RH"]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2004, 2, 10),
    to: new Date(2004, 2, 17),
  });
  const chartRef = useRef<HTMLDivElement>(null);

  const toggleProperty = (property: string) => {
    setSelectedProperties(prev =>
      prev.includes(property) ? prev.filter(p => p !== property) : [...prev, property],
    );
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    let processedData = data
      .map(d => ({
        ...d,
        day: new Date(d.timestamp).toLocaleDateString(),
        date: new Date(d.timestamp),
      }))
      .filter((_, index) => index % 4 === 0);

    // Apply date range filter if both dates are selected
    if (dateRange?.from && dateRange?.to) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      processedData = processedData.filter(d => d.date >= fromDate && d.date <= toDate);
    }
    return processedData;
  }, [data, dateRange]);

  const toggleFullscreen = () => {
    if (!chartRef.current)
      return;

    if (!isFullscreen) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      }
    }
    else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(document.fullscreenElement !== null);
  }, []);

  const handleFilterSubmit = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardDescription>
            {dateRange?.from && dateRange?.to
              ? (
                  <span>
                    Data from
                    {" "}
                    {format(dateRange.from, "PP")}
                    {" "}
                    to
                    {" "}
                    {format(dateRange.to, "PP")}
                  </span>
                )
              : (
                  "Time series data of air pollutants"
                )}
          </CardDescription>
          <div className="flex gap-2">
            <FilterForm onSubmit={handleFilterSubmit} initialDateRange={dateRange} />
            <Button onClick={toggleFullscreen} variant="outline" size="icon">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <div ref={chartRef} className="w-full h-full min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend
                content={(
                  <CustomLegend
                    properties={properties}
                    selectedProperties={selectedProperties}
                    toggleProperty={toggleProperty}
                  />
                )}
              />
              {properties.map(
                prop =>
                  selectedProperties.includes(prop.key) && (
                    <Line
                      key={prop.key}
                      type="monotone"
                      dataKey={prop.key}
                      name={prop.label}
                      stroke={prop.color}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                  ),
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

type CustomLegendProps = {
  properties: Array<{ key: string; label: string; color: string }>;
  selectedProperties: string[];
  toggleProperty: (property: string) => void;
};

const CustomLegend: React.FC<CustomLegendProps> = ({ properties, selectedProperties, toggleProperty }) => {
  return (
    <div className="flex flex-wrap gap-3 p-2">
      {properties.map(prop => (
        <label key={prop.key} className="flex items-center space-x-1 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={selectedProperties.includes(prop.key)}
              onChange={() => toggleProperty(prop.key)}
              className="sr-only"
            />
            <div
              className={`w-3 h-3 border rounded-full ${
                selectedProperties.includes(prop.key) ? "bg-primary border-primary" : "bg-background border-gray-300"
              }`}
              style={{ borderColor: prop.color }}
            >
              {selectedProperties.includes(prop.key) && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ color: prop.color }}>
                  <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="4" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <span className="text-xs font-medium" style={{ color: prop.color }}>
            {prop.label}
          </span>
        </label>
      ))}
    </div>
  );
};
