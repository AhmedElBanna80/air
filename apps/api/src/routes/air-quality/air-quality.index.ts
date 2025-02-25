import { createRouter } from "../../lib/create-app.ts";
import * as handlers from "./air-quality.handlers.ts";
import * as routes from "./air-quality.routes.ts";

const router = createRouter()
  .openapi(routes.measurements, handlers.getMeasurements)
  .openapi(routes.upload, handlers.uploadMeasurements);

export default router;
