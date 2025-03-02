import { serve } from '@hono/node-server'
import env from './env'
import { Hono } from 'hono'
import { honoMiddleware } from './middlewares/middleware'
import { indexRoute } from './routes';
import { rootContainer } from './di-container'
import { pinoLogger } from './middlewares/pino-logger';
// Create Hono app
const app = new Hono()
app.use(honoMiddleware(rootContainer, app)) 
app.use(pinoLogger())
app.route('/', indexRoute)

// Apply middleware


serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})