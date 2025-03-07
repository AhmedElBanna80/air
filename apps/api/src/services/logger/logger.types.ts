import type { Container } from "di-wise";
import type { PinoLogger } from "hono-pino";

import { Scope, Type } from "di-wise";

import { loggerProvider } from "./logger.provider";

export type Logger = PinoLogger;

export const LoggerToken = Type<Logger>("Logger");

export function registerLogger(container: Container) {
  container.register(LoggerToken, loggerProvider, { scope: Scope.Container });
}
