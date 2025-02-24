import { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { pinoLogger } from "../middlewares/pino-logger.js";
import type { AppBindings } from "./types.js";
import { airQualityRepository } from "../repositories/air-quality.js";
import { CsvParserService } from "../services/csv-parser.js";
import { defaultHook } from "stoker/openapi";
import { notFound, onError } from "stoker/middlewares";
import { BASE_PATH } from "./constants.js";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  const csvParserService = new CsvParserService();

  app.use(pinoLogger());
  app.use("*", pinoLogger());
  app.use("*", async (c, next) => {
    c.set("airQualityRepository", airQualityRepository);
    c.set("csvParserService", csvParserService);
    await next();
  });
  app.notFound(notFound);
  app.onError(onError);
  return app;
}
export type AppOpenAPI = OpenAPIHono<AppBindings, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
