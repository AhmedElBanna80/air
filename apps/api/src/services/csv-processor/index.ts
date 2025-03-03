import type { Container } from "di-wise";

import { Scope } from "di-wise";

import { CsvProcessorService } from "./csv-processor.service";
import { CsvProcessorServiceToken } from "./csv-processor.types";

export * from "./csv-processor.service";
export * from "./csv-processor.types";

export function registerCsvProcessorService(container: Container) {
  container.register(CsvProcessorServiceToken, {
    useClass: CsvProcessorService,
  }, { scope: Scope.Container });
}
