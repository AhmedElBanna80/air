import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import airQualityRouter from './routes/air-quality/upload.js'
import env from './env.js'

const app = new Hono()

app.use('*', logger())
app.route('/api', airQualityRouter)

serve({
  fetch: app.fetch,
  port: env.PORT,
}, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`)
})
