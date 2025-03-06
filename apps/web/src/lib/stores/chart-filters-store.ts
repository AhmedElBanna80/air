import { Derived, Effect, Store } from '@tanstack/react-store';
import { useTimeSeriesData } from '../queries/get-charts-data';



// Define the chart filters state type
export type ChartFiltersState = {
  from: Date;
  to: Date;
  groupBy: string;
}

// Default values
const defaultFrom = new Date("2001-01-01");
const defaultTo = new Date(); // Now


// Create the initial state
const initialState = {
  from: defaultFrom,
  to: defaultTo,
  groupBy: 'day',
};

export const chartFiltersStore = new Store<ChartFiltersState>(initialState);

