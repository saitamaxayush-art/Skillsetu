import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Server } from 'http'
import { app } from '../server.js'
import { db } from '../db/connection.js'

describe('SkillSetu REST API Endpoints & Routes', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any
        baseUrl = `http://localhost:${addr.port}`
        resolve()
      })
    })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  })

  it('GET /api/health responds with SkillSetu service info', async () => {
    const res = await fetch(`${baseUrl}/api/health`)
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.status).toBe('ok')
    expect(data.service).toBe('SkillSetu Backend')
  })

  it('POST /auth/request-otp accepts phone number and returns mock OTP hint', async () => {
    const res = await fetch(`${baseUrl}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9822990011' }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.otpHint).toBe('123456')
  })

  it('POST /auth/verify-otp validates OTP and returns JWT token and user profile', async () => {
    const res = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9822990011', otp: '123456', language: 'hi' }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.token).toBeDefined()
    expect(data.user.phone).toBe('9822990011')
  })

  it('GET /skills returns trade catalog with bilingual labels', async () => {
    const res = await fetch(`${baseUrl}/skills`)
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.skills.length).toBeGreaterThanOrEqual(10)
    const tailoring = data.skills.find((s: any) => s.id === 'tailoring')
    expect(tailoring.hi).toBeDefined()
    expect(tailoring.en).toBeDefined()
  })

  it('GET /skills/:id/questions returns 5 practical scenario questions in Hindi and English', async () => {
    const res = await fetch(`${baseUrl}/skills/tailoring/questions`)
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.questions.length).toBe(5)
    expect(data.questions[0].question_hi).toBeDefined()
    expect(data.questions[0].question_en).toBeDefined()
    expect(data.questions[0].options_hi.length).toBe(4)
  })

  it('POST /skills/:id/answers evaluates answers and places into Beginner/Intermediate/Skilled without fail message', async () => {
    const res = await fetch(`${baseUrl}/skills/tailoring/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { questionId: 'q_tailor_1', selectedIndex: 0 },
          { questionId: 'q_tailor_2', selectedIndex: 0 },
          { questionId: 'q_tailor_3', selectedIndex: 0 },
        ],
      }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.level).toBe('Intermediate')
    expect(data.score).toBe(3)
    expect(data.feedback_hi).toBeDefined()
    expect(data.feedback_en).toBeDefined()
  })

  it('PUT /profile/step/:n autosaves individual onboarding steps', async () => {
    const res = await fetch(`${baseUrl}/profile/step/2`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sunita Pawar',
        village_town: 'Hadapsar',
        district: 'Pune',
      }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.step).toBe(2)
  })

  it('GET /opportunities returns opportunities in 3 buckets (best, related, nearby)', async () => {
    const res = await fetch(`${baseUrl}/opportunities?role=tailoring`)
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(Array.isArray(data.bestMatch)).toBe(true)
    expect(Array.isArray(data.nearbyOpportunities)).toBe(true)
    expect(data.bestMatch.length).toBeGreaterThan(0)
    expect(data.bestMatch[0].reasons_hi.length).toBeGreaterThan(0)
    expect(data.bestMatch[0].reasons_en.length).toBeGreaterThan(0)
  })

  it('POST /applications stores application and returns working multi-channel contact links', async () => {
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunityId: 'opp_tailor_1',
        notes: 'Experienced with home-based ladies tailoring',
      }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.contact.whatsappUrl).toContain('wa.me')
    expect(data.contact.telUrl).toContain('tel:')
    expect(data.contact.smsUrl).toContain('sms:')
  })

  it('GET /resources returns learning resources ordered strictly from lowest cost to highest (free first)', async () => {
    const res = await fetch(`${baseUrl}/resources?role=tailoring&mode=all`)
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.all.length).toBeGreaterThanOrEqual(5)
    for (let i = 0; i < data.all.length - 1; i++) {
      expect(data.all[i].cost).toBeLessThanOrEqual(data.all[i + 1].cost)
    }
  })

  it('GET /career-path returns 5-stage interactive vertical roadmap with schemes and free weekly actions', async () => {
    const res = await fetch(`${baseUrl}/career-path?role=tailoring`)
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.roadmap.stages.length).toBe(5)
    const stage1 = data.roadmap.stages[0]
    expect(stage1.weekly_action_hi).toBeDefined()
    expect(stage1.schemes_hi).toContain('विश्वकर्मा')
  })

  it('POST /progress ticks off milestone roadmap steps and persists in database', async () => {
    db.prepare('DELETE FROM user_career_progress WHERE target_role = ?').run('test_trade')
    const res = await fetch(`${baseUrl}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 'test_trade', stepNumber: 1 }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.success).toBe(true)
    expect(data.completedSteps).toContain(1)
  })
})
