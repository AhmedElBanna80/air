import { hc } from 'hono/client'
import type { AppBindings } from '../types.js'
import { OpenAPIHono } from '@hono/zod-openapi'

// Create type-safe client
export const client = hc<OpenAPIHono<AppBindings>>('http://localhost:3001/api')

export async function uploadAirQualityData(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return client.airQuality.upload.$post({
    form: formData
  })
}
