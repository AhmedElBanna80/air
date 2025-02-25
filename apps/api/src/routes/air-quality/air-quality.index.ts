import { createRouter } from "../../lib/create-app.ts";
import * as allData from "./all-data.ts";
import * as measurements from "./measurements.ts";
import * as upload from "./upload.ts";

const router = createRouter()
  .openapi(measurements.route, measurements.handler)
  .openapi(upload.route, upload.handler)
  .openapi(allData.route, allData.handler);

export default router;
