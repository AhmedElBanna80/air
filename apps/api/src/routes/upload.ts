import { Hono } from "hono";
import { Buffer } from "node:buffer";

import { S3ServiceToken } from "../services/s3";
import { inject } from "../middlewares/middleware";

const uploadRoute = new Hono();

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Inject S3 service


// Upload CSV file to S3
uploadRoute.post("/csv", async (c) => {
  try {
    const s3Service = inject(c, S3ServiceToken);
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

    // Return success response with file location
    return c.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        key: result.key,
        location: result.location,
        etag: result.etag,
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
