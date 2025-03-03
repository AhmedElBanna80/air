import type { Container } from "di-wise";

import { Scope } from "di-wise";

import { CsvParserService } from "./csv-parser.service";
import { CsvParserServiceToken } from "./csv-parser.types";

export * from "./csv-parser.service";
export * from "./csv-parser.types";

export function registerCsvParserService(container: Container) {
  container.register(CsvParserServiceToken, {
    useClass: CsvParserService,
  }, { scope: Scope.Container });
}
