CREATE TABLE IF NOT EXISTS "air_quality_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
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
CREATE INDEX IF NOT EXISTS "timestamp_idx" ON "air_quality_measurements" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "temperature_idx" ON "air_quality_measurements" ("temperature");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "humidity_idx" ON "air_quality_measurements" ("relative_humidity");