import { Container } from "di-wise";
import { registerAirQualityService } from "./air-quality";
import { registerLogger } from "./logger";
import { registerDatabase } from "./db/database.provider";
import { registerContext } from "./context";

export function registerServices(container: Container) {
  registerAirQualityService(container);
  registerLogger(container);
  registerDatabase(container);
  registerContext(container);
}