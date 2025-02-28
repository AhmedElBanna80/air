import { serve } from '@hono/node-server'
import app from './routes/air-measurements'
import env from './env'

// Start server
serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
}) 