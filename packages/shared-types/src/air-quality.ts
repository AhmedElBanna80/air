// Air quality measurement types
export type BucketWidth = "microsecond" | "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century";

// Raw measurement from API
export interface AirQualityMeasurement {
  timestamp: string;
  avgTemperature: number;
  avgHumidity: number;
  avgAbsoluteHumidity: number;
  avgCO_GT: number;
  avgCO_S1: number;
  avgNMHC_GT: number;
  avgNMHC_S2: number;
  avgBenzene_GT: number;
  avgNOx_GT: number;
  avgNOx_S3: number;
  avgNO2_GT: number;
  avgNO2_S4: number;
  avgO3_S5: number;
}

// Formatted for chart consumption in web app
export interface ChartMeasurement {
  timestamp: string;
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
}

// Chart display properties
export interface Property {
  key: string;
  label: string;
  color: string;
}

// API response for measurements endpoint
export interface MeasurementsResponse {
    measurements: AirQualityMeasurement[];
    count: number;
  }
  
  // API response for all-data endpoint
  export interface AllDataResponse {
    data: AirQualityMeasurement[];
    count: number;
  }
  
  // Common error response
  export interface ErrorResponse {
    error: string;
    details?: string | any;
  }

  // Query parameters for fetching measurements
export interface MeasurementsQueryParams {
    from: string; // ISO date string
    to: string; // ISO date string
    groupBy: BucketWidth;
    limit?: number;
  }
  
  // Query parameters for all data
  export interface AllDataQueryParams {
    from: string; // ISO date string
    to: string; // ISO date string
    limit?: number;
  }