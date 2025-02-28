import { Hono } from "hono";
import airMeasurementsApp  from "./air-measurements";

const indexRoute = new Hono()

indexRoute.route('/air-measurements', airMeasurementsApp)

export { indexRoute };