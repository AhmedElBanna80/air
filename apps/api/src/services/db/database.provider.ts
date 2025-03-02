import type { Container, FactoryProvider } from "di-wise";

import { inject, Scope, Type } from "di-wise";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

import env from "@/api/env";

import type { Schema } from "./schema";

import { LoggerToken } from "../logger";
import { schema } from "./schema";

function createDatabase() {
  const logger = inject(LoggerToken);
  const pool = new pkg.Pool({
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    max: 10, // Limit maximum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection isn't established
  });
  pool.on("error", (err) => {
    logger.error("Pool error:", err);
  });

  pool.on("connect", () => {
    logger.info("Pool connected");
  });

  return drizzle(pool, { schema });
}

export type DataBaseType = ReturnType<typeof createDatabase>;

export const DataBase = Type<DataBaseType>("DataBase");

class DatabaseProvider implements FactoryProvider<DataBaseType> {
  useFactory() {
    if (env.NODE_ENV !== "test") {
      return createDatabase();
    }
    return drizzle.mock<Schema>() as unknown as DataBaseType;
  }
};

export const databaseProvider = new DatabaseProvider();

export function registerDatabase(container: Container) {
  container.register(DataBase, databaseProvider, { scope: Scope.Container });
}

// Cleanup function for graceful shutdown
export async function closeDatabase() {
  if (sharedPool) {
    console.log("Closing database connection pool");
    await sharedPool.end();
    sharedPool = null;
  }
}
