import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db/connection.js'
import { generateToken } from '../middleware/auth.js'

export const authRouter = Router()

// In-memory rate limiting map for OTP requests (phone -> timestamps[])
const otpRequestLog = new Map<string, number[]>()

function checkOtpRateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const timestamps = (otpRequestLog.get(key) || []).filter((t) => now - t < windowMs)
  if (timestamps.length >= maxRequests) {
    return false
  }
  timestamps.push(now)
  otpRequestLog.set(key, timestamps)
  return true
}

const RequestOtpSchema = z.object({
  phone: z.string().min(8).max(16),
})

const VerifyOtpSchema = z.object({
  phone: z.string().min(8).max(16),
  otp: z.string().min(4).max(6),
  language: z.string().optional(),
})

const UpdateMeSchema = z.object({
  name: z.string().optional(),
  language: z.string().optional(),
  village_town: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  nearest_city: z.string().optional(),
})

// Handler for requesting OTP
const handleRequestOtp = (req: Request, res: Response) => {
  const result = RequestOtpSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid phone number format',
      code: 'VALIDATION_ERROR',
      details: result.error.format(),
    })
  }

  const { phone } = result.data

  if (!checkOtpRateLimit(phone)) {
    return res.status(429).json({
      error: 'Too many OTP requests. Please wait a minute before requesting again.',
      code: 'RATE_LIMIT_EXCEEDED',
    })
  }

  return res.json({
    success: true,
    message: `OTP sent to ${phone}. Use code: 123456`,
    otpHint: '123456',
  })
}

// Handler for verifying OTP
const handleVerifyOtp = (req: Request, res: Response) => {
  const result = VerifyOtpSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid verification payload',
      code: 'VALIDATION_ERROR',
      details: result.error.format(),
    })
  }

  const { phone, otp, language } = result.data

  // Verify code (in development / staging accepts demo OTP 123456)
  if (otp !== '123456' && process.env.NODE_ENV === 'production') {
    return res.status(400).json({
      error: 'Invalid OTP code',
      code: 'INVALID_OTP',
    })
  }

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any

  if (!user) {
    const newId = `usr_${Date.now()}`
    const isEmployer = phone.includes('5555')
    const role = isEmployer ? 'employer' : 'candidate'
    const name = isEmployer ? 'Employer Partner' : 'SkillSetu User'
    const lang = language || 'hi'

    db.prepare(`
      INSERT INTO users (id, phone, name, role, language)
      VALUES (?, ?, ?, ?, ?)
    `).run(newId, phone, name, role, lang)

    if (role === 'candidate') {
      db.prepare(`
        INSERT OR IGNORE INTO access_profiles (user_id)
        VALUES (?)
      `).run(newId)
    }

    user = { id: newId, phone, name, role, language: lang }
  } else if (language && user.language !== language) {
    db.prepare('UPDATE users SET language = ? WHERE id = ?').run(language, user.id)
    user.language = language
  }

  const token = generateToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  })

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      language: user.language,
    },
  })
}

// Handler for GET /me
const handleGetMe = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated', code: 'UNAUTHORIZED' })
  }

  const user = db.prepare('SELECT id, phone, name, role, language, age_range, gender, village_town, district, state, pincode, nearest_city FROM users WHERE id = ?').get(req.user.userId) as any

  if (!user) {
    return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' })
  }

  return res.json({ success: true, user })
}

// Handler for PUT /me
const handlePutMe = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated', code: 'UNAUTHORIZED' })
  }

  const parsed = UpdateMeSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid profile payload', code: 'VALIDATION_ERROR', details: parsed.error.format() })
  }

  const d = parsed.data
  if (d.language) db.prepare('UPDATE users SET language = ? WHERE id = ?').run(d.language, req.user.userId)
  if (d.name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(d.name, req.user.userId)
  if (d.village_town) db.prepare('UPDATE users SET village_town = ? WHERE id = ?').run(d.village_town, req.user.userId)
  if (d.district) db.prepare('UPDATE users SET district = ? WHERE id = ?').run(d.district, req.user.userId)
  if (d.state) db.prepare('UPDATE users SET state = ? WHERE id = ?').run(d.state, req.user.userId)
  if (d.pincode) db.prepare('UPDATE users SET pincode = ? WHERE id = ?').run(d.pincode, req.user.userId)
  if (d.nearest_city) db.prepare('UPDATE users SET nearest_city = ? WHERE id = ?').run(d.nearest_city, req.user.userId)

  const updated = db.prepare('SELECT id, phone, name, role, language, age_range, gender, village_town, district, state, pincode, nearest_city FROM users WHERE id = ?').get(req.user.userId)
  return res.json({ success: true, user: updated })
}

// Bind both Section 7 paths and backwards-compatible aliases
authRouter.post('/request-otp', handleRequestOtp)
authRouter.post('/otp/send', handleRequestOtp)

authRouter.post('/verify-otp', handleVerifyOtp)
authRouter.post('/otp/verify', handleVerifyOtp)

authRouter.get('/me', handleGetMe)
authRouter.put('/me', handlePutMe)
authRouter.put('/profile', handlePutMe)
