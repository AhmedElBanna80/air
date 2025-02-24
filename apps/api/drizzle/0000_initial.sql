-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create the measurements table
CREATE TABLE air_quality_measurements (
    timestamp TIMESTAMP NOT NULL,
    co_gt REAL NOT NULL,
    co_s1 REAL NOT NULL,
    nmhc_gt REAL NOT NULL,
    nmhc_s2 REAL NOT NULL,
    benzene_gt REAL NOT NULL,
    nox_gt REAL NOT NULL,
    nox_s3 REAL NOT NULL,
    no2_gt REAL NOT NULL,
    no2_s4 REAL NOT NULL,
    o3_s5 REAL NOT NULL,
    temperature REAL NOT NULL,
    relative_humidity REAL NOT NULL,
    absolute_humidity REAL NOT NULL
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('air_quality_measurements', 'timestamp');

-- Create indexes for common queries
CREATE INDEX ON air_quality_measurements (timestamp DESC);
CREATE INDEX ON air_quality_measurements (temperature);
CREATE INDEX ON air_quality_measurements (relative_humidity);