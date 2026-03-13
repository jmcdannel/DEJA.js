import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/firebase'

interface AuthContext {
  uid: string
  email: string
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401)
  }

  const token = header.slice(7)
  try {
    const decoded = await auth.verifyIdToken(token)
    c.set('auth', { uid: decoded.uid, email: decoded.email ?? '' })
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})
