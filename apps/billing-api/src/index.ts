import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { subscribeRoute } from './routes/subscribe'
import { webhookRoute } from './routes/webhook'
import { billingPortalRoute } from './routes/billing-portal'
import { changePlanRoute } from './routes/change-plan'
import { cleanupLogsRoute } from './routes/cleanup-logs'

const app = new Hono()

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5174,http://localhost:3011')
  .split(',')
  .map(o => o.trim())

app.use('/api/*', cors({
  origin: allowedOrigins,
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
}))

app.route('/api', subscribeRoute)
app.route('/api', webhookRoute)
app.route('/api', billingPortalRoute)
app.route('/api', changePlanRoute)
app.route('/api', cleanupLogsRoute)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

const port = parseInt(process.env.PORT ?? '3000', 10)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Billing API running on http://localhost:${info.port}`)
})

export default app
