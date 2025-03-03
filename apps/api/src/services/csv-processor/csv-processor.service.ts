import { inject, Injectable } from "di-wise";
import { Readable } from "node:stream";

import env from "@/api/env";

import type { AirQualityMeasurement } from "../../repositories/measurements/measurements.types";
import type { OutputType } from "../csv-parser/csv-parser.types";
import type { CsvProcessorServiceType } from "./csv-processor.types";

import { AiQualityRepo } from "../../repositories/measurements/measurements.types";
import { CsvParserServiceToken } from "../csv-parser/csv-parser.types";
import { LoggerToken } from "../logger/logger.types";
import { CsvProcessorServiceToken } from "./csv-processor.types";

@Injectable<CsvProcessorService>(CsvProcessorServiceToken)
export class CsvProcessorService implements CsvProcessorServiceType {
  private readonly logger = inject(LoggerToken);
  private readonly csvParserService = inject(CsvParserServiceToken);
  private readonly airQualityRepo = inject(AiQualityRepo);

  /**
   * Process a CSV file that was uploaded to S3
   * @param fileKey - The S3 key of the uploaded file
   * @returns The number of rows inserted into the database
   */
  async processUploadedCsvFile(fileKey: string): Promise<number> {
    try {
      this.logger.info(`Processing CSV file: ${fileKey}`);

      // Download the file from S3
      const response = await fetch(`${env.S3_ENDPOINT}/${env.S3_BUCKET}/${fileKey}`);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const file = new File([blob], fileKey.split("/").pop() || "data.csv", { type: "text/csv" });

      // Parse the CSV file
      const readableStream = this.csvParserService.parseAirQualityData(file);

      // Process the parsed data in batches
      let totalRowsInserted = 0;

      await new Promise<void>((resolve, reject) => {
        readableStream.on("data", async (batch: OutputType[]) => {
          try {
            // Pause the stream to prevent overwhelming memory
            readableStream.pause();

            // Map the OutputType to AirQualityMeasurement
            const measurements = batch.map(row => ({
              timestamp: row.timestamp,
              coGT: row.coGT,
              coS1: row.coS1,
              nmhcGT: row.nmhcGT,
              nmhcS2: row.nmhcS2,
              benzeneGT: row.benzeneGT,
              noxGT: row.noxGT,
              noxS3: row.noxS3,
              no2GT: row.no2GT,
              no2S4: row.no2S4,
              o3S5: row.o3S5,
              temperature: row.temperature,
              relativeHumidity: row.relativeHumidity,
              absoluteHumidity: row.absoluteHumidity,
            } as AirQualityMeasurement));
            this.logger.info(`Inserting ${measurements.length} rows into the database`);
            // Insert the batch into the database
            const rowsInserted = await this.airQualityRepo.insertBatch(measurements);
            totalRowsInserted += rowsInserted;
            this.logger.info(`Inserted ${rowsInserted} rows, total: ${totalRowsInserted}`);

            // Resume the stream
            readableStream.resume();
          }
          catch (error) {
            reject(error);
          }
        });

        readableStream.on("end", () => {
          this.logger.info(`Finished processing CSV file: ${fileKey}`);
          resolve();
        });

        readableStream.on("error", (error) => {
          this.logger.error(`Error processing CSV file: ${fileKey}`, error);
          reject(error);
        });
      });

      return totalRowsInserted;
    }
    catch (error) {
      this.logger.error(`Error processing CSV file ${fileKey}:`, error);
      throw error;
    }
  }
}
