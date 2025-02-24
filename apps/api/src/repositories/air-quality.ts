import { airQualityMeasurements } from '@/db/schema.js'
import { createInsertSchema } from 'drizzle-zod'
import { type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { db } from '../db/index.js'

const insertAirQualitySchema = createInsertSchema(airQualityMeasurements)

type AirQualityMeasurement = typeof airQualityMeasurements.$inferInsert

export class AirQualityRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async insertBatch(measurements: AirQualityMeasurement[]) {
    const parsedMeasurements = measurements
      .map(measurement => {
        try {
          return insertAirQualitySchema.parse(measurement)
        } catch (error) {
          console.error('Validation error:', error)
          return null
        }
      })
      .filter((m): m is AirQualityMeasurement => m !== null)

    if (parsedMeasurements.length === 0) {
      return 0
    }

    try {
      await this.db
        .insert(airQualityMeasurements)
        .values(parsedMeasurements)
      
      return parsedMeasurements.length
    } catch (error) {
      console.error('Database insertion error:', error)
      throw error
    }
  }
}

export const airQualityRepository = new AirQualityRepository(db as unknown as NodePgDatabase)
