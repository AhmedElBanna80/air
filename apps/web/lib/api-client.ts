import { hc } from 'hono/client'
import {client} from 'api/types/api-client.js'

// Create type-safe client
export const client = hc<AppBindings>('http://localhost:3001/api')

export async function uploadAirQualityData(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return client.airQuality.upload.$post({
    form: formData
  })
}
