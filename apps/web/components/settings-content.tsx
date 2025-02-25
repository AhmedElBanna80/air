import type { FormEventHandler } from "react";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";

type SettingsContentProps = {
  properties: Array<{ key: string; label: string; color: string }>;
  selectedProperties: string[];
  toggleProperty: (property: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: FormEventHandler<HTMLDivElement> & ((date: DateRange | undefined) => void);
};

export function SettingsContent({
  properties,
  selectedProperties,
  toggleProperty,
  dateRange,
  onDateRangeChange,
}: SettingsContentProps) {
  return (
    <div className="py-4">
      <h3 className="mb-4 text-lg font-medium">Date Range</h3>
      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
      />
      <h3 className="mb-4 mt-8 text-lg font-medium">Properties</h3>
      <div className="space-y-4">
        {properties.map(prop => (
          <div key={prop.key} className="flex items-center space-x-2">
            <Checkbox
              id={prop.key}
              checked={selectedProperties.includes(prop.key)}
              onCheckedChange={() => toggleProperty(prop.key)}
            />
            <label
              htmlFor={prop.key}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {prop.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
