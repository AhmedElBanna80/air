import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import Papa from "papaparse";
import { z } from "zod";
import { insertAirQualitySchema } from "@/db/schema.js";

export type CsvParserCallback = (
  measurement: z.infer<typeof insertAirQualitySchema>,
) => Promise<void>;

export class CsvParserService {
  async parseAirQualityData(
    file: File,
    onMeasurement: CsvParserCallback,
  ): Promise<{ rowsProcessed: number }> {
    const webStream: ReadableStream = file.stream() as ReadableStream;
    const stream = Readable.fromWeb(webStream);

    let rowCount = 0;
    let isFirstRow = true;
    let currentMonth = 3;
    let currentYear = 2004;

    return new Promise((resolve, reject) => {
      Papa.parse(stream, {
        delimiter: ";",
        header: false,
        skipEmptyLines: "greedy",
        transform: (value) => {
          if (value.trim() === "") return null;
          const normalized = value.replace(",", ".");
          const num = parseFloat(normalized);
          return isNaN(num) ? value : num;
        },
        step: async (results) => {
          try {
            if (isFirstRow) {
              isFirstRow = false;
              return;
            }

            const row = results.data as (string | number)[];
            if (!Array.isArray(row) || row.length < 15) {
              console.log("Invalid row length:", row);
              return;
            }

            const day = Number(row[0]);
            const hour = Number(row[1]);

            if (
              isNaN(day) ||
              day < 1 ||
              day > 31 ||
              isNaN(hour) ||
              hour < 0 ||
              hour > 23
            ) {
              console.log("Invalid date/time components:", {
                day,
                hour,
                currentMonth,
                currentYear,
              });
              return;
            }

            const timestamp = new Date(
              currentYear,
              currentMonth - 1,
              day,
              hour,
              0,
            );

            if (isNaN(timestamp.getTime())) {
              console.log("Invalid timestamp created:", timestamp);
              return;
            }

            const measurement: z.infer<typeof insertAirQualitySchema> = {
              timestamp,
              coGT: Number(row[2]),
              coS1: Number(row[3]),
              nmhcGT: Number(row[4]),
              nmhcS2: Number(row[5]),
              benzeneGT: Number(row[6]),
              noxGT: Number(row[7]),
              noxS3: Number(row[8]),
              no2GT: Number(row[9]),
              no2S4: Number(row[10]),
              o3S5: Number(row[11]),
              temperature: Number(row[12]),
              relativeHumidity: Number(row[13]),
              absoluteHumidity: Number(row[14]),
            };

            const hasInvalidNumber = Object.entries(measurement).some(
              ([key, value]) => {
                if (key === "timestamp") return false;
                if (typeof value === "number") {
                  return isNaN(value) || value === null;
                }
                return false;
              },
            );

            if (hasInvalidNumber) {
              console.log("Row contains NaN or null values - skipping");
              return;
            }

            await onMeasurement(measurement);
            rowCount++;
          } catch (error) {
            console.error("Error processing row:", error);
          }
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("Parsing errors:", results.errors);
            reject(new Error("CSV parsing failed"));
            return;
          }
          resolve({ rowsProcessed: rowCount });
        },
        error: (error) => {
          console.error("Parser error:", error);
          reject(error);
        },
      });
    });
  }
}

export const csvParserService = new CsvParserService();
