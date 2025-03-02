import type { Container } from "di-wise";

import { registerAirQualityRepo } from "./measurements";
import { registerParametersRepo } from "./parameters";

export * from "./measurements";
export * from "./parameters";

export function registerRepositories(container: Container) {
  registerAirQualityRepo(container);
  registerParametersRepo(container);
}
