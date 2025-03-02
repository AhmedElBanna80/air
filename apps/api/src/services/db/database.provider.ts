import type { Container, FactoryProvider } from "di-wise";

import { Type } from "di-wise";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

import env from "@/api/env";

import type { Schema } from "./schema";

import { schema } from "./schema";

function createDatabase() {
  const pool = new pkg.Pool({
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  });
  pool.connect();
  pool.on("error", (err) => {
    console.error("Pool error:", err);
  });
  pool.on("connect", () => {
    console.log("Pool connected");
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
  container.register(DataBase, databaseProvider);
}
