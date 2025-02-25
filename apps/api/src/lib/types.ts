import type { db } from "./../db/index.ts";
import type { PinoLogger } from "hono-pino";
import type { AirQualityRepository } from "../repositories/air-quality.ts";
import type { CsvParserService } from "../services/csv-parser.ts";
import {
  OpenAPIHono,
  type RouteHandler,
  type RouteConfig,
} from "@hono/zod-openapi";

export interface AppBindings {
  Variables: {
    db: typeof db;
    logger: PinoLogger;
    airQualityRepository: AirQualityRepository;
    csvParserService: CsvParserService;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
export interface TypedReadable<T> {
  on(event: "close", listener: () => void): this;
  on(event: "data", listener: (chunk: T) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "pause", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "resume", listener: () => void): this;
  
  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (chunk: T) => void): this;
}
