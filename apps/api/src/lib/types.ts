import type { PinoLogger } from "hono-pino";
import type { AirQualityRepository } from "../repositories/air-quality.js";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    airQualityRepository: AirQualityRepository;
  };
}
