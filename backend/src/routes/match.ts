import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db/connection.js'
import {
  buildRoadmapForRole,
  filterAndRankResources,
  LearningResourceItem,
  OpportunityItem,
  rankOpportunities,
  UserGoalInput,
  UserProfileInput,
  UserSkillInput,
} from '../engine/matching.js'

export const matchRouter = Router()

// Helper to fetch user's full profile & skills
function getUserData(userId: string) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any
  const profileRow = db.prepare('SELECT * FROM access_profiles WHERE user_id = ?').get(userId) as any
  const skillRows = db.prepare('SELECT * FROM user_skills WHERE user_id = ?').all(userId) as any[]
  const goalRow = db.prepare('SELECT * FROM user_goals WHERE user_id = ?').get(userId) as any

  const skills: UserSkillInput[] = skillRows.map((s) => ({
    skillId: s.skill_id,
    level: s.level || 'Beginner',
    yearsExp: s.years_exp,
    quizScore: s.quiz_score,
  }))

  const profile: UserProfileInput = {
    canTravelKm: profileRow?.can_travel_km ?? 15,
    travelMode: profileRow?.travel_mode ?? 'bus',
    wfhOnly: Boolean(profileRow?.wfh_only),
    availableHours: profileRow?.available_hours ?? 8,
    childcareLimits: Boolean(profileRow?.childcare_limits),
    literacyLevel: profileRow?.literacy_level ?? 'basic',
    languages: (profileRow?.languages_spoken || 'hi,en').split(','),
    minPay: profileRow?.min_pay ?? 10000,
  }

  const goal: UserGoalInput = {
    targetRole: goalRow?.target_role || skills[0]?.skillId || 'tailoring',
    goalType: goalRow?.goal_type || 'job',
  }

  return { user, profile, skills, goal }
}

const ApplySchema = z.object({
  opportunityId: z.string().min(1),
  notes: z.string().optional(),
})

const ProgressSchema = z
  .object({
    targetRole: z.string().optional(),
    role: z.string().optional(),
    stepNumber: z.number().int(),
  })
  .refine((d) => Boolean(d.targetRole || d.role), {
    message: 'targetRole or role is required',
  })
  .transform((d) => ({
    targetRole: (d.targetRole || d.role) as string,
    stepNumber: d.stepNumber,
  }))

// 1. GET /opportunities (and GET /) - Matches categorized into 3 buckets
export const handleGetOpportunities = (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  const { profile, skills, goal } = getUserData(userId)

  // Query parameter filters
  const { kind, wfh, maxDistance, role } = req.query

  let opps = db.prepare('SELECT * FROM opportunities').all() as OpportunityItem[]

  if (kind && kind !== 'all') {
    opps = opps.filter((o) => o.kind === kind)
  }
  if (wfh === 'true' || wfh === '1') {
    opps = opps.filter((o) => o.work_from_home === 1)
  }
  if (maxDistance) {
    const maxMins = Number(maxDistance) * 3 // approx 1 km = 3 mins transit
    opps = opps.filter((o) => o.mins <= maxMins)
  }

  // Fetch user applied opportunity IDs
  const appliedRows = db.prepare('SELECT opportunity_id FROM applications WHERE user_id = ?').all(userId) as any[]
  const appliedSet = new Set(appliedRows.map((a) => a.opportunity_id))

  const currentRole = (role as string) || goal.targetRole || 'tailoring'
  const effectiveGoal: UserGoalInput = { ...goal, targetRole: currentRole }
  const userSkills = skills.length > 0 ? skills : [{ skillId: currentRole, level: 'Intermediate' as const }]

  const ranked = rankOpportunities(opps, userSkills, profile, effectiveGoal)

  const markApplied = (items: any[]) =>
    items.map((item) => ({
      ...item,
      applied: appliedSet.has(item.id),
    }))

  return res.json({
    success: true,
    targetRole: effectiveGoal.targetRole,
    bestMatch: markApplied(ranked.bestMatch),
    relatedSkills: markApplied(ranked.relatedSkills),
    nearbyOpportunities: markApplied(ranked.nearbyOpportunities),
    totalCount: opps.length,
  })
}

// 2. POST /applications (and POST /apply) - Apply or contact employer
export const handleApplyOpportunity = (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'

  const parsed = ApplySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'opportunityId is required', code: 'VALIDATION_ERROR', details: parsed.error.format() })
  }

  const { opportunityId, notes } = parsed.data

  const opp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(opportunityId) as OpportunityItem | undefined
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found', code: 'NOT_FOUND' })
  }

  // Insert or update application
  db.prepare(`
    INSERT INTO applications (user_id, opportunity_id, status, notes, applied_at)
    VALUES (?, ?, 'applied', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, opportunity_id) DO UPDATE SET
      applied_at = CURRENT_TIMESTAMP,
      notes = excluded.notes
  `).run(userId, opportunityId, notes || '')

  return res.json({
    success: true,
    message: 'Application recorded successfully',
    contact: {
      phone: opp.contact_phone,
      whatsapp: opp.contact_whatsapp,
      whatsappUrl: `https://wa.me/91${opp.contact_whatsapp}?text=${encodeURIComponent(
        `नमस्ते, मैंने SkillSetu ऐप पर आपकी नौकरी "${opp.title_hi}" देखी है और मैं आवेदन करना चाहता हूँ।`
      )}`,
      telUrl: `tel:${opp.contact_phone}`,
      smsUrl: `sms:${opp.contact_phone}?body=${encodeURIComponent(
        `SkillSetu Application for ${opp.title_en}`
      )}`,
    },
  })
}

// 3. GET /resources and GET /learn - Learning resources (free first)
export const handleGetResources = (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  const { skills, goal } = getUserData(userId)

  const targetRole = (req.query.role as string) || goal.targetRole || skills[0]?.skillId || 'tailoring'
  const mode = (req.query.mode as any) || 'all'
  const maxCost = req.query.maxCost ? Number(req.query.maxCost) : 100000

  const allResources = db.prepare('SELECT * FROM learning_resources').all() as LearningResourceItem[]
  const ranked = filterAndRankResources(allResources, targetRole, skills[0]?.level || 'Beginner', mode, maxCost)

  return res.json({
    success: true,
    targetRole,
    online: ranked.online,
    offline: ranked.offline,
    all: ranked.all,
    freeCount: ranked.freeCount,
  })
}

// 4. GET /career-path - 5-Stage Career Roadmap
export const handleGetCareerPath = (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  const { skills, goal } = getUserData(userId)

  const targetRole = (req.query.role as string) || goal.targetRole || skills[0]?.skillId || 'tailoring'

  const rawRoadmap = db.prepare('SELECT * FROM career_roadmaps WHERE target_role = ?').get(targetRole) as any
  const progressRow = db.prepare('SELECT * FROM user_career_progress WHERE user_id = ? AND target_role = ?').get(userId, targetRole) as any
  const completedSteps = progressRow?.completed_steps_json ? JSON.parse(progressRow.completed_steps_json) : []

  const roadmap = buildRoadmapForRole(targetRole, rawRoadmap, completedSteps)

  return res.json({
    success: true,
    roadmap: {
      ...roadmap,
      completedSteps,
    },
  })
}

// 5. POST /progress and POST /career-path/toggle-step - Tick off roadmap step
export const handleToggleProgress = (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'

  const parsed = ProgressSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'targetRole and stepNumber are required', code: 'VALIDATION_ERROR', details: parsed.error.format() })
  }

  const { targetRole, stepNumber } = parsed.data

  const progressRow = db.prepare('SELECT * FROM user_career_progress WHERE user_id = ? AND target_role = ?').get(userId, targetRole) as any
  let completed: number[] = progressRow?.completed_steps_json ? JSON.parse(progressRow.completed_steps_json) : []

  if (completed.includes(stepNumber)) {
    completed = completed.filter((s) => s !== stepNumber)
  } else {
    completed.push(stepNumber)
  }

  const currentStage = Math.min(5, Math.max(1, Math.floor(completed.length / 2) + 1))

  db.prepare(`
    INSERT INTO user_career_progress (user_id, target_role, completed_steps_json, current_stage, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, target_role) DO UPDATE SET
      completed_steps_json = excluded.completed_steps_json,
      current_stage = excluded.current_stage,
      updated_at = CURRENT_TIMESTAMP
  `).run(userId, targetRole, JSON.stringify(completed), currentStage)

  return res.json({
    success: true,
    completedSteps: completed,
    currentStage,
  })
}

// Bind routes
matchRouter.get('/', handleGetOpportunities)
matchRouter.get('/opportunities', handleGetOpportunities)
matchRouter.post('/apply', handleApplyOpportunity)
matchRouter.post('/applications', handleApplyOpportunity)
matchRouter.get('/applied', (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  const applications = db.prepare(`
    SELECT a.*, o.title_en, o.title_hi, o.org, o.pay, o.area_en, o.area_hi, o.contact_phone, o.contact_whatsapp
    FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.user_id = ?
    ORDER BY a.applied_at DESC
  `).all(userId)
  return res.json({ success: true, applications })
})
matchRouter.get('/learn', handleGetResources)
matchRouter.get('/resources', handleGetResources)
matchRouter.get('/career-path', handleGetCareerPath)
matchRouter.post('/career-path/toggle-step', handleToggleProgress)
matchRouter.post('/progress', handleToggleProgress)
