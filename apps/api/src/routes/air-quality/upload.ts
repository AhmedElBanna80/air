
import { Readable } from 'node:stream'
import { ReadableStream } from "node:stream/web"
import { createRouter } from '@/lib/create-app.js'
import Papa from 'papaparse'

const router = createRouter()

router.post('/air-quality/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400)
    }

    const webStream: ReadableStream = file.stream() as ReadableStream
    const stream = Readable.fromWeb(webStream)
    
    let rowCount = 0
    let isFirstRow = true
    let currentMonth: number | null = null
    let currentYear: number | null = null

    return await new Promise((resolve, reject) => {
      Papa.parse(stream, {
        delimiter: ';',
        header: false,
        skipEmptyLines: 'greedy',
        transform: (value) => {
          if (value.trim() === '') return null
          const normalized = value.replace(',', '.')
          const num = parseFloat(normalized)
          return isNaN(num) ? value : num
        },
        step: async (results) => {
          try {
            if (isFirstRow) {
              // Assuming first row is header, you might want to extract month/year from filename or ask user
              currentMonth = 3 // March (adjust as needed)
              currentYear = 2004 // (adjust as needed)
              isFirstRow = false
              return
            }

            const row = results.data as (string | number)[]
            if (!Array.isArray(row) || row.length < 15) {
              console.log('Invalid row length:', row)
              return
            }

            const day = Number(row[0])
            const hour = Number(row[1])
            
            if (!currentMonth || !currentYear || 
                isNaN(day) || day < 1 || day > 31 ||
                isNaN(hour) || hour < 0 || hour > 23) {
              console.log('Invalid date/time components:', { day, hour, currentMonth, currentYear })
              return
            }

            const timestamp = new Date(
              currentYear,
              currentMonth - 1,
              day,
              hour,
              0  // minutes set to 0
            )

            if (isNaN(timestamp.getTime())) {
              console.log('Invalid timestamp created:', timestamp)
              return
            }

            const measurement = {
              timestamp,
              coGT: Number(row[2]),
              coS1: Number(row[3]),
              nmhcGT: Number(row[4]),
              nmhcS2: Number(row[5]),
              benzeneGT: Number(row[6]),
              noxGT: Number(row[7]),
              noxS3: Number(row[8]),
              no2GT: Number(row[9]),
              no2S4: Number(row[10]),
              o3S5: Number(row[11]),
              temperature: Number(row[12]),
              relativeHumidity: Number(row[13]),
              absoluteHumidity: Number(row[14])
            }

            // Only filter out NaN values or null, allow -200 as it represents missing data
            const hasInvalidNumber = Object.entries(measurement)
              .some(([key, value]) => {
                if (key === 'timestamp') return false
                if (typeof value === 'number') {
                    return isNaN(value) || value === null
                }
                return false
              })

            if (hasInvalidNumber) {
              console.log('Row contains NaN or null values - skipping')
              return
            }

            try {
              const insertedCount = await c.var.airQualityRepository.insertBatch([measurement])
              if (insertedCount > 0) {
                rowCount++
                console.log('Successfully inserted row:', rowCount)
              }
            } catch (error) {
              console.error('Error inserting measurement:', error)
            }
          } catch (error) {
            console.error('Error processing row:', error)
          }
        },
        complete: (results) => {
          if(results.errors.length > 0) {
            console.error('Parsing errors:', results.errors)
            return
          }
          console.log('Parsing completed, total rows processed:', rowCount)
          resolve(c.json({ 
            message: 'Upload completed',
            status: 'success',
            rowsProcessed: rowCount
          }))
        },
        error: (error) => {
          console.error('Parser error:', error)
          reject(c.json({ 
            error: 'Failed to process file',
            details: error.message
          }, 500))
        }
      })
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default router










