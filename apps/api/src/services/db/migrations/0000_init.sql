CREATE EXTENSION IF NOT EXISTS timescaledb;
DROP TABLE IF EXISTS "parameters";
CREATE TABLE "parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"unit" text NOT NULL,
	"min_safe_value" double precision,
	"max_safe_value" double precision,
	CONSTRAINT "parameters_name_unique" UNIQUE("name")
);
DROP TABLE IF EXISTS "air_quality_measurements";
--> statement-breakpoint
CREATE TABLE "air_quality_measurements" (
	"timestamp" timestamp NOT NULL,
	"co_gt" real NOT NULL,
	"co_s1" real NOT NULL,
	"nmhc_gt" real NOT NULL,
	"nmhc_s2" real NOT NULL,
	"benzene_gt" real NOT NULL,
	"nox_gt" real NOT NULL,
	"nox_s3" real NOT NULL,
	"no2_gt" real NOT NULL,
	"no2_s4" real NOT NULL,
	"o3_s5" real NOT NULL,
	"temperature" real NOT NULL,
	"relative_humidity" real NOT NULL,
	"absolute_humidity" real NOT NULL,
	CONSTRAINT "air_quality_measurements_timestamp_unique" UNIQUE("timestamp")
);
--> statement-breakpoint
CREATE INDEX "timestamp_idx" ON "air_quality_measurements" USING btree ("timestamp");