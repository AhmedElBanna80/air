import type { Logger } from "pino";

import { pinoLogger as logger } from "hono-pino";

import { rootContainer } from "../di-container";
import { LoggerToken } from "../services/logger/logger.types";

export function pinoLogger() {
  return logger({
    pino: rootContainer.resolve(LoggerToken) as unknown as Logger,
    http: {
      // Generate unique request IDs
      reqId: () => crypto.randomUUID(),
    },
  });
}
