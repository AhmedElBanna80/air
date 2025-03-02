import type { Container } from "di-wise";

import { registerAirQualityService } from "./air-quality";
import { registerContext } from "./context";
import { registerDatabase } from "./db/database.provider";
import { registerLogger } from "./logger";

export function registerServices(container: Container) {
  registerAirQualityService(container);
  registerLogger(container);
  registerDatabase(container);
  registerContext(container);
}
