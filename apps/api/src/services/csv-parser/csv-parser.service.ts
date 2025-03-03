import type { ReadableStream } from "node:stream/web";

import * as csv from "fast-csv";
import { inject, Injectable } from "di-wise";
import { Readable, Transform } from "node:stream";
import { z } from "zod";

import type { Logger } from "../logger/logger.types";
import type { CsvParserServiceType, InputType, OutputType } from "./csv-parser.types";
import type { TypedReadable } from "../../lib/types";

import { BatchTransform } from "../../lib/batch-transform";
import { LoggerToken } from "../logger/logger.types";
import { CsvParserServiceToken } from "./csv-parser.types";

// Define input and output schemas
const inputSchema = z.object({
  "Date": z.string(),
  "Time": z.string(),
  "CO(GT)": z.string(),
  "PT08.S1(CO)": z.string(),
  "NMHC(GT)": z.string(),
  "C6H6(GT)": z.string(),
  "PT08.S2(NMHC)": z.string(),
  "NOx(GT)": z.string(),
  "PT08.S3(NOx)": z.string(),
  "NO2(GT)": z.string(),
  "PT08.S4(NO2)": z.string(),
  "PT08.S5(O3)": z.string(),
  "T": z.string(),
  "RH": z.string(),
  "AH": z.string(),
});

const outputSchema = inputSchema.transform((row) => {
  const [day, month, year] = row.Date.split("/").map(Number);
  const [hour, minute, second] = row.Time.split(".").map(Number);
  const timestamp = new Date(
    Number(year),
    Number(month) - 1,
    day,
    hour,
    minute,
    second,
  );
  const parseNumber = (s: string) => Number(s.replace(",", "."));
  return {
    timestamp,
    coGT: parseNumber(row["CO(GT)"]),
    coS1: parseNumber(row["PT08.S1(CO)"]),
    nmhcGT: parseNumber(row["NMHC(GT)"]),
    benzeneGT: parseNumber(row["C6H6(GT)"]),
    nmhcS2: parseNumber(row["PT08.S2(NMHC)"]),
    noxGT: parseNumber(row["NOx(GT)"]),
    noxS3: parseNumber(row["PT08.S3(NOx)"]),
    no2GT: parseNumber(row["NO2(GT)"]),
    no2S4: parseNumber(row["PT08.S4(NO2)"]),
    o3S5: parseNumber(row["PT08.S5(O3)"]),
    temperature: parseNumber(row.T),
    relativeHumidity: parseNumber(row.RH),
    absoluteHumidity: parseNumber(row.AH),
  };
});

@Injectable<CsvParserService>(CsvParserServiceToken)
export class CsvParserService implements CsvParserServiceType {
  private readonly logger = inject(LoggerToken);

  // Here we explicitly annotate that the stream emits batches (arrays) of OutputType.
  parseAirQualityData(
    file: File,
    batchSize = 1000,
  ): TypedReadable<OutputType[]> {
    const webStream = file.stream() as ReadableStream;
    const nodeStream = Readable.fromWeb(webStream);

    // Create a pipeline that:
    // 1. Parses CSV rows into objects (InputType),
    // 2. Transforms them via Zod into OutputType,
    // 3. Batches them into arrays of OutputType.
    return nodeStream
      .pipe(
        csv.parse<InputType, OutputType>({
          delimiter: ";",
          headers: true,
          ignoreEmpty: true,
          trim: true,
        }),
      )
      .transform((row: InputType) => {
        try {
          return outputSchema.parse(row);
        }
        catch (error) {
          this.logger.error({ error, row }, "Error parsing row");
          // Skip invalid rows by returning null
          return null;
        }
      })
      .pipe(
        new Transform({
          objectMode: true,
          transform(chunk: OutputType | null, _encoding, callback) {
            if (chunk !== null) {
              callback(null, chunk);
            }
            else {
              callback();
            }
          },
        }),
      )
      .pipe(new BatchTransform<OutputType>(batchSize)) as TypedReadable<
      OutputType[]
    >;
  }
} 