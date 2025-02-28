import { drizzle } from "drizzle-orm/node-postgres";
/* eslint-disable no-console */
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { exit } from "node:process";
import { Pool } from "pg";

import env from "../env";
import { checkDatabaseConnection, closeDatabaseConnection, db } from "./index";
// import * as schema from "./schema";

// TimescaleDB-specific setup function
async function setupTimescaleDB() {
  // Create a direct connection to run raw SQL commands
  const pool = new Pool({
    host: env.POSTGRES_HOST || "localhost",
    port: env.POSTGRES_PORT || 5432,
    user: env.POSTGRES_USER || "myuser",
    password: env.POSTGRES_PASSWORD || "airqualitydb",
    database: env.POSTGRES_DB || "airqualitydb",
  });

  try {
    const client = await pool.connect();

    // Enable TimescaleDB extension if not already enabled
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
    `);
    console.log("TimescaleDB extension enabled");

    // Convert the measurements table to a hypertable
    await client.query(`
      SELECT create_hypertable('air_quality_measurements', 'timestamp', 
        if_not_exists => TRUE, 
        chunk_time_interval => INTERVAL '1 day'
      );
    `);
    console.log("Hypertable created for air_quality_measurements");

    // Create continuous aggregates for daily, weekly, and monthly averages
    // Daily aggregates
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS daily_air_quality_aggregates
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket('1 day', timestamp) AS bucket,
        avg(co) AS avg_co,
        avg(nmhc) AS avg_nmhc,
        avg(benzene) AS avg_benzene,
        avg(nox) AS avg_nox,
        avg(no2) AS avg_no2,
        avg(pt08_s1) AS avg_pt08_s1,
        avg(pt08_s2) AS avg_pt08_s2,
        avg(pt08_s3) AS avg_pt08_s3,
        avg(pt08_s4) AS avg_pt08_s4,
        avg(pt08_s5) AS avg_pt08_s5,
        min(co) AS min_co,
        max(co) AS max_co,
        min(benzene) AS min_benzene,
        max(benzene) AS max_benzene
      FROM air_quality_measurements
      GROUP BY bucket;
    `);
    console.log("Created daily aggregates view");

    // Add policy for continuous aggregation refresh
    await client.query(`
      SELECT add_continuous_aggregate_policy('daily_air_quality_aggregates',
        start_offset => INTERVAL '3 months',
        end_offset => INTERVAL '1 hour',
        schedule_interval => INTERVAL '1 day');
    `);
    console.log("Added refresh policy for daily aggregates");

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_air_quality_parameter_timestamp 
      ON air_quality_measurements (timestamp DESC);
    `);
    console.log("Created indexes for better query performance");

    // Add compression policy (if needed for older data)
    await client.query(`
      ALTER TABLE air_quality_measurements SET (
        timescaledb.compress,
        timescaledb.compress_segmentby = ''
      );
    `);

    await client.query(`
      SELECT add_compression_policy('air_quality_measurements', 
        compress_after => INTERVAL '30 days');
    `);
    console.log("Added compression policy for older data");

    client.release();
    await pool.end();
    console.log("TimescaleDB setup completed successfully");
  }
  catch (error) {
    console.error("Error setting up TimescaleDB:", error);
    await pool.end();
    exit(1);
  }
}

// Main migration function
async function main() {
  try {
    // Check database connection
    const connected = await checkDatabaseConnection();
    if (!connected) {
      console.error("Cannot proceed with migrations - database connection failed");
      exit(1);
    }

    console.log("Running Drizzle migrations...");
    // Run Drizzle migrations from the migrations folder
    const pool = new Pool();
    const db = drizzle(pool);
    await migrate(db as any, { migrationsFolder: "drizzle" });
    await pool.end();
    console.log("Drizzle migrations completed");

    // Set up TimescaleDB specific features
    console.log("Setting up TimescaleDB features...");
    await setupTimescaleDB();

    // Close database connection
    await closeDatabaseConnection();
    console.log("All migrations completed successfully");
  }
  catch (error) {
    console.error("Migration error:", error);
    await closeDatabaseConnection();
    exit(1);
  }
}

// Run migrations
main();
