import { pgTable, timestamp, real, serial } from 'drizzle-orm/pg-core'

export const airQualityMeasurements = pgTable('air_quality_measurements', {
  id: serial('id').primaryKey(),
  // Timestamp from Date and Time columns combined
  timestamp: timestamp('timestamp').notNull(),
  
  // CO measurements
  coGT: real('co_gt').notNull(), // CO(GT)
  coS1: real('co_s1').notNull(), // PT08.S1(CO)
  
  // NMHC measurements
  nmhcGT: real('nmhc_gt').notNull(), // NMHC(GT)
  nmhcS2: real('nmhc_s2').notNull(), // PT08.S2(NMHC)
  
  // Benzene
  benzeneGT: real('benzene_gt').notNull(), // C6H6(GT)
  
  // NOx measurements
  noxGT: real('nox_gt').notNull(), // NOx(GT)
  noxS3: real('nox_s3').notNull(), // PT08.S3(NOx)
  
  // NO2 measurements
  no2GT: real('no2_gt').notNull(), // NO2(GT)
  no2S4: real('no2_s4').notNull(), // PT08.S4(NO2)
  
  // O3 measurement
  o3S5: real('o3_s5').notNull(), // PT08.S5(O3)
  
  // Environmental conditions
  temperature: real('temperature').notNull(), // T
  relativeHumidity: real('relative_humidity').notNull(), // RH
  absoluteHumidity: real('absolute_humidity').notNull(), // AH
})
