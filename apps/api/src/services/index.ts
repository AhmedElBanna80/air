import type { Container } from "di-wise";

import { registerAirQualityService } from "./air-quality";
import { registerContext } from "./context";
import { registerCsvParserService } from "./csv-parser";
import { registerCsvProcessorService } from "./csv-processor";
import { registerDatabase } from "./db/database.provider";
import { registerLogger } from "./logger";
import { registerS3Service } from "./s3";

export function registerServices(container: Container) {
  registerAirQualityService(container);
  registerCsvParserService(container);
  registerCsvProcessorService(container);
  registerLogger(container);
  registerDatabase(container);
  registerContext(container);
  registerS3Service(container);
}
