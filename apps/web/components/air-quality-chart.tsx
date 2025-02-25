"use client";

import type { DateRange } from "react-day-picker";

import { format } from "date-fns";
import { Maximize2, Minimize2, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { SettingsContent } from "./settings-content";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const toggleProperty = (property: string) => {
    setSelectedProperties(prev =>
      prev.includes(property) ? prev.filter(p => p !== property) : [...prev, property],
    );
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log("No data available");
      return [];
    }

    console.log("Processing data in AirQualityChart:", data.length);

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

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="pb-2">
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
            <Button variant="outline" size="icon" onClick={toggleSettings}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button onClick={toggleFullscreen} variant="outline" size="icon">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div ref={chartRef} className={`h-[calc(100vh-12rem)] ${isFullscreen ? "h-screen" : ""}`}>
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
              <Legend />
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
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Chart Settings</SheetTitle>
            <SheetDescription>Adjust the date range and select properties to display.</SheetDescription>
          </SheetHeader>
          <SettingsContent
            properties={properties}
            selectedProperties={selectedProperties}
            toggleProperty={toggleProperty}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
