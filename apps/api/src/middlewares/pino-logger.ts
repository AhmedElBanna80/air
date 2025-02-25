import { pinoLogger as logger } from "hono-pino";
import pino from "pino";

import env from "../env.ts";

// Create a pretty stream for development
const prettyStream = ({
  colorize: true,
  translateTime: "SYS:standard",
  ignore: "pid,hostname",
  messageFormat: "{msg} {req.method} {req.url}",
});

export const LOGGER = pino({
  level: env.LOG_LEVEL || "debug",
  transport: {
    target: "pino-pretty",
    options: prettyStream,
  },
});

// Log the current configuration
LOGGER.debug({
  env: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
  port: env.PORT,
}, "Logger initialized with configuration");

export function pinoLogger() {
  return logger({
    pino: LOGGER,
    http: {
      // Generate unique request IDs
      reqId: () => crypto.randomUUID(),
    },
  });
}
