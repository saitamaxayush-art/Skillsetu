import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { seed } from './db/seed.js'
import { authRouter } from './routes/auth.js'
import { communityRouter } from './routes/community.js'
import { matchRouter } from './routes/match.js'
import { profileRouter } from './routes/profile.js'
import { smsRouter } from './routes/sms.js'
import { ttsRouter } from './routes/tts.js'
import { verificationRouter } from './routes/verification.js'
import { authMiddleware } from './middleware/auth.js'

dotenv.config()

export const app = express()
const PORT = process.env.PORT || 8787

// Configure CORS through .env
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*'

app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  })
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(authMiddleware)

// Ensure database is initialized and seeded on startup
seed()

// Health check endpoint
const handleHealth = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'SkillSetu Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  })
}
app.get('/health', handleHealth)
app.get('/api/health', handleHealth)

// Route mounting helper to support both /api/* (via Vite proxy) and root /* routes
const registerAllRoutes = (prefix = '') => {
  // 1. Auth routes
  app.use(`${prefix}/auth`, authRouter)
  app.get(`${prefix}/me`, (req, res, next) => {
    req.url = '/me'
    authRouter(req, res, next)
  })
  app.put(`${prefix}/me`, (req, res, next) => {
    req.url = '/me'
    authRouter(req, res, next)
  })

  // 2. Profile and Skills routes
  app.use(`${prefix}/profile`, profileRouter)
  app.get(`${prefix}/skills`, (req, res, next) => {
    req.url = '/skills'
    profileRouter(req, res, next)
  })
  app.get(`${prefix}/skills/:id/questions`, (req, res, next) => {
    req.url = `/skills/${req.params.id}/questions`
    profileRouter(req, res, next)
  })
  app.post(`${prefix}/skills/:id/answers`, (req, res, next) => {
    req.url = `/skills/${req.params.id}/answers`
    profileRouter(req, res, next)
  })

  // 3. Opportunities, Resources, Career Path, and Progress
  app.use(`${prefix}/match`, matchRouter)
  app.use(`${prefix}/opportunities`, matchRouter)
  app.use(`${prefix}/applications`, (req, res, next) => {
    req.url = '/apply'
    matchRouter(req, res, next)
  })
  app.use(`${prefix}/resources`, (req, res, next) => {
    req.url = '/resources'
    matchRouter(req, res, next)
  })
  app.use(`${prefix}/learn`, (req, res, next) => {
    req.url = '/learn'
    matchRouter(req, res, next)
  })
  app.use(`${prefix}/career-path`, (req, res, next) => {
    req.url = '/career-path' + (req.url === '/' ? '' : req.url)
    matchRouter(req, res, next)
  })
  app.use(`${prefix}/progress`, (req, res, next) => {
    req.url = '/progress'
    matchRouter(req, res, next)
  })

  // 4. Community and SMS routes
  app.use(`${prefix}/community`, communityRouter)
  app.use(`${prefix}/sms`, smsRouter)

  // 5. Text-to-speech audio proxy route
  app.use(`${prefix}/tts`, ttsRouter)

  // 6. Work & skill video verification routes
  app.use(`${prefix}/verification`, verificationRouter)
}

// Register both /api and root endpoints
registerAllRoutes('/api')
registerAllRoutes('')

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}`, code: 'NOT_FOUND' })
})

// Global JSON error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err?.message || err)
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR', message: err?.message || 'Unknown error' })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SkillSetu backend server listening on http://localhost:${PORT}`)
  })
}
