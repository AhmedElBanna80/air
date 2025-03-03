import { Type } from "di-wise";

export type CsvProcessorServiceType = {
  processUploadedCsvFile: (fileKey: string) => Promise<number>;
};

export const CsvProcessorServiceToken = Type<CsvProcessorServiceType>("CsvProcessorService");
