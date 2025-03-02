import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

import env from "../../env";
import * as schema from "./schema";

const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
