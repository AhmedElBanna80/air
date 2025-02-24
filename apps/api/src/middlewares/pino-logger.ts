import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import env from "../env.js";

export function pinoLogger() {
  return logger({
    pino: pino({
      level: env.LOG_LEVEL,
    }),
    http: {
      // Generate unique request IDs
      reqId: () => crypto.randomUUID(),
    },
  });
}
