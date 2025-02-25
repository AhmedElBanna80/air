import { pinoLogger as logger } from "hono-pino";
import pino from "pino";

import env from "../env.ts";

export const LOGGER = pino({
  level: env.LOG_LEVEL,
});

export function pinoLogger() {
  return logger({
    pino: LOGGER,
    http: {
      // Generate unique request IDs
      reqId: () => crypto.randomUUID(),
    },
  });
}
