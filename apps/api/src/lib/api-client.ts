import type { OpenAPIHono } from "@hono/zod-openapi";

import { hc } from "hono/client";

import type { AppBindings } from "./types";

// Define the API routes type
type AppType = OpenAPIHono<AppBindings>;

// Create type-safe client
export const client = hc<AppType>("http://localhost:3001/api");

export async function uploadAirQualityData(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:3001/api/air-quality/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}
