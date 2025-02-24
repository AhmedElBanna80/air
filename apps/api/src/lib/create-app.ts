import { OpenAPIHono } from '@hono/zod-openapi'
import { pinoLogger } from '../middlewares/pino-logger.js'
import type { AppBindings } from './types.js'
import { airQualityRepository } from '../repositories/air-quality.js'

export function createRouter() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
  })
  
  app.use('*', pinoLogger())
  app.use('*', async (c, next) => {
    c.set('airQualityRepository', airQualityRepository)
    await next()
  })
  
  return app
}

export default function createApp() {
  const app = createRouter()
  return app
}
