import type { FactoryProvider } from "di-wise";

import pino from "pino";

import env from "@/api/env";

import type { Logger } from "./logger.types";

const prettyStream = ({
  colorize: true,
  translateTime: "SYS:standard",
  ignore: "pid,hostname",
  messageFormat: "{msg} {req.method} {req.url}",
});

export class LoggerProvider implements FactoryProvider<Logger> {
  useFactory() {
    const logger = pino({
      level: env.LOG_LEVEL,
      transport: {
        targets: [{
          level: env.LOG_LEVEL,
          target: "pino-pretty",
          options: prettyStream,
        }],
      },
    });
    return logger as unknown as Logger;
  };
}
export const loggerProvider = new LoggerProvider();
