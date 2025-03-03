import { Hono } from "hono";
import { Buffer } from "node:buffer";

import { inject } from "../middlewares/middleware";
import { CsvProcessorServiceToken } from "../services/csv-processor";
import { S3ServiceToken } from "../services/s3";

const uploadRoute = new Hono();

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Upload CSV file to S3
uploadRoute.post("/csv", async (c) => {
  try {
    const s3Service = inject(c, S3ServiceToken);
    const csvProcessor = inject(c, CsvProcessorServiceToken);

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get("file");

    // Validate file exists
    if (!file || !(file instanceof File)) {
      return c.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return c.json(
        { success: false, message: "Only CSV files are allowed" },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return c.json(
        { success: false, message: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    // Read file content as buffer
    const fileContent = Buffer.from(await file.arrayBuffer());
    // Generate unique key for the file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `uploads/${timestamp}-${file.name}`;

    // Upload to S3 using the injected service
    const result = await s3Service.uploadFile(
      fileContent,
      key,
      "text/csv",
    );

    // Process the uploaded CSV file and insert into database
    let processingError = null;
    let processingPromise = null;

    try {
      // Start processing in a way that doesn't block the response
      // but ensures the processing actually happens
      processingPromise = (async () => {
        try {
          // Process the CSV file and insert data into the database
          const rowsInserted = await csvProcessor.processUploadedCsvFile(key);
          console.log(`Successfully processed and inserted ${rowsInserted} rows from ${key}`);
          return rowsInserted;
        }
        catch (error) {
          console.error("CSV processing error:", error);
          throw error;
        }
      })();
      
      // Don't await the promise here, but make sure it runs
      // This keeps the promise alive even after we return the response
      processingPromise.catch((err) => {
        console.error("Background processing failed:", err);
      });
    }
    catch (error) {
      processingError = String(error);
    }

    // Return success response with file location
    return c.json({
      success: true,
      message: "File uploaded successfully. Processing started.",
      data: {
        key: result.key,
        location: result.location,
        etag: result.etag,
        processing: processingError ? "failed" : "started",
      },
    });
  }
  catch (error) {
    console.error("Upload error:", error);
    return c.json(
      { success: false, message: "Error uploading file" },
      { status: 500 },
    );
  }
});

// Get info about uploaded files
uploadRoute.get("/files", async (c) => {
  try {
    const s3Service = inject(c, S3ServiceToken);
    const files = await s3Service.listFiles("uploads/");

    return c.json({
      success: true,
      files: files.map(file => ({
        key: file.key,
        size: file.size,
        lastModified: file.lastModified,
      })),
    });
  }
  catch (error) {
    console.error("Error listing files:", error);
    return c.json(
      { success: false, message: "Error listing files" },
      { status: 500 },
    );
  }
});

export default uploadRoute;
