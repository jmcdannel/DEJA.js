import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './app'

const port = parseInt(process.env.PORT ?? '3000', 10)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Billing API running on http://localhost:${info.port}`)
})
