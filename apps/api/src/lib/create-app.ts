import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { pinoLogger } from "../middlewares/pino-logger.ts";
import { CsvParserService } from "../services/csv-parser.ts";
import type { AppBindings } from "./types.ts";
import { db } from "../db/index.ts";
import { AirQualityRepository } from "../repositories/air-quality.ts";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  app.use(pinoLogger());
  app.use("*", pinoLogger());
  app.use("*", async (c, next) => {
    c.set("db", db);
    c.set("airQualityRepository", new AirQualityRepository(db, c.var.logger));
    c.set("csvParserService", new CsvParserService(c.var.logger));
    await next();
  });
  app.notFound(notFound);
  app.onError(onError);
  return app;
}
