import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

import type { AirQualityRepository } from "../repositories/air-quality.ts";
import type { CsvParserService } from "../services/csv-parser.ts";
import type { db } from "./../db/index.ts";

export type AppBindings = {
  Variables: {
    db: typeof db;
    logger: PinoLogger;
    airQualityRepository: AirQualityRepository;
    csvParserService: CsvParserService;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
export type TypedReadable<T> = {
  on: ((event: "close", listener: () => void) => TypedReadable<T>) &
    ((event: "data", listener: (chunk: T) => void) => TypedReadable<T>) &
    ((event: "end", listener: () => void) => TypedReadable<T>) &
    ((event: "error", listener: (err: Error) => void) => TypedReadable<T>) &
    ((event: "pause", listener: () => void) => TypedReadable<T>) &
    ((event: "readable", listener: () => void) => TypedReadable<T>) &
    ((event: "resume", listener: () => void) => TypedReadable<T>);

  once: ((event: "close", listener: () => void) => TypedReadable<T>) &
    ((event: "data", listener: (chunk: T) => void) => TypedReadable<T>);
};
