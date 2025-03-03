import type { Container } from "di-wise";

import { Scope, Type } from "di-wise";

import type { TypedReadable } from "../../lib/types";

export type InputType = {
  "Date": string;
  "Time": string;
  "CO(GT)": string;
  "PT08.S1(CO)": string;
  "NMHC(GT)": string;
  "C6H6(GT)": string;
  "PT08.S2(NMHC)": string;
  "NOx(GT)": string;
  "PT08.S3(NOx)": string;
  "NO2(GT)": string;
  "PT08.S4(NO2)": string;
  "PT08.S5(O3)": string;
  "T": string;
  "RH": string;
  "AH": string;
};

export type OutputType = {
  timestamp: Date;
  coGT: number;
  coS1: number;
  nmhcGT: number;
  benzeneGT: number;
  nmhcS2: number;
  noxGT: number;
  noxS3: number;
  no2GT: number;
  no2S4: number;
  o3S5: number;
  temperature: number;
  relativeHumidity: number;
  absoluteHumidity: number;
};

export type CsvParserServiceType = {
  parseAirQualityData: (file: File, batchSize?: number) => TypedReadable<OutputType[]>;
};

export const CsvParserServiceToken = Type<CsvParserServiceType>("CsvParserService");
