import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'Hello from API!' }))

serve({
  fetch: app.fetch,
  port: 3001,
}, () => {
  console.log('Server is running on http://localhost:3001')
})