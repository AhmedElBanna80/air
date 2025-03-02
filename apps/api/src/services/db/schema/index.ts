import { airQualityMeasurements } from "./air-quality";
import { parameters } from "./parameters";

export const schema = {
  parameters,
  airQualityMeasurements,
};

export type Schema = typeof schema;
