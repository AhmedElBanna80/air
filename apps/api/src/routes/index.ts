import { Hono } from "hono";

import airMeasurementsApp from "./air-measurements";
import healthRoute from "./health";
import parametersRoute from "./parameters";
import timeSeriesRoute from "./time-series";

const indexRoute = new Hono();

indexRoute.route("/air-measurements", airMeasurementsApp);
indexRoute.route("/health", healthRoute);
indexRoute.route("/parameters", parametersRoute);
indexRoute.route("/time-series", timeSeriesRoute);

export { indexRoute };
