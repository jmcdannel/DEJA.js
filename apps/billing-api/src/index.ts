import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { subscribeRoute } from './routes/subscribe'
import { webhookRoute } from './routes/webhook'
import { billingPortalRoute } from './routes/billing-portal'
import { changePlanRoute } from './routes/change-plan'

const app = new Hono()

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3011')
  .split(',')
  .map(o => o.trim())

app.use('/api/*', cors({
  origin: allowedOrigins,
  allowMethods: ['POST'],
  allowHeaders: ['Authorization', 'Content-Type'],
}))

app.route('/api', subscribeRoute)
app.route('/api', webhookRoute)
app.route('/api', billingPortalRoute)
app.route('/api', changePlanRoute)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

export default app
