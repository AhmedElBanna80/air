import { createRouter } from "../../lib/create-app.js";
import * as handlers from "./air-quality.handlers.js";
import * as routes from "./air-quality.routes.js";

const router = createRouter()
  .openapi(routes.measurements, handlers.getMeasurements)
  .openapi(routes.upload, handlers.uploadMeasurements);

export default router;
