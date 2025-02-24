import type { PinoLogger } from "hono-pino";
import type { AirQualityRepository } from "../repositories/air-quality.js";
import type { CsvParserService } from "../services/csv-parser.js";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    airQualityRepository: AirQualityRepository;
    csvParserService: CsvParserService;
  };
}
