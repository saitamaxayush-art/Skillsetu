import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db/connection.js'

export const profileRouter = Router()

// Distinct trade skills catalog with bilingual labels and descriptions
export const SKILLS_CATALOG = [
  { id: 'tailoring', category: 'craft', en: 'Stitching & Tailoring', hi: 'सिलाई व बुटीक कार्य', desc_en: 'Blouse, suits, alterations, embroidery & boutique finishing', desc_hi: 'ब्लाउज, सूट, अल्टरिंग, कढ़ाई व बुटीक कार्य' },
  { id: 'electrician', category: 'technical_trade', en: 'Electrician & Solar', hi: 'इलेक्ट्रीशियन व सोलर', desc_en: 'House wiring, rooftop solar, motors & home appliances', desc_hi: 'घरेलू वायरिंग, सोलर पैनल, मोटर व उपकरण मरम्मत' },
  { id: 'plumbing', category: 'technical_trade', en: 'Plumbing & Piping', hi: 'प्लंबिंग व नल-फिटिंग', desc_hi: 'नल, टंकी, बाथरूम फिटिंग और ड्रिप सिंचाई', desc_en: 'Pipes, sanitaryware, leak repair & drip irrigation' },
  { id: 'carpentry', category: 'craft', en: 'Carpentry & Furniture', hi: 'बढ़ई व लकड़ी का काम', desc_en: 'Modular kitchen, wooden furniture, sofa frame & handicrafts', desc_hi: 'मॉड्यूलर किचन, फर्नीचर, सोफा ढांचा व हस्तशिल्प' },
  { id: 'cooking', category: 'service', en: 'Cooking & Tiffin Service', hi: 'रसोई व टिफिन सेवा', desc_en: 'Home tiffin, breakfast kiosks, catering & packaged snacks', desc_hi: 'घर से टिफिन, नाश्ता स्टॉल, कैटरिंग व नाश्ता' },
  { id: 'beauty', category: 'service', en: 'Beauty Parlour & Salon', hi: 'ब्यूटी पार्लर व मेकअप', desc_en: 'Threading, facial, bridal mehendi, hair care & makeup', desc_hi: 'थ्रेडिंग, फेशियल, ब्राइडल मेहंदी, हेयर केयर व मेकअप' },
  { id: 'driving', category: 'service', en: 'Driving & Transport', hi: 'ड्राइविंग व ट्रांसपोर्ट', desc_en: 'E-rickshaw, delivery loader, cab, school van & tractor', desc_hi: 'ई-रिक्शा, डिलीवरी लोडर, कैब, स्कूल वैन व ट्रैक्टर' },
  { id: 'webdev', category: 'digital', en: 'Web Development', hi: 'वेबसाइट व कोडिंग', desc_en: 'HTML, CSS, React, responsive web pages & digital tools', desc_hi: 'HTML, CSS, रिएक्ट, वेब पेज व डिजिटल टूल्स' },
  { id: 'data_entry', category: 'digital', en: 'Data Entry & Computer Operator', hi: 'डेटा एंट्री व कंप्यूटर ऑपरेटर', desc_en: 'Excel, hospital billing, Aadhaar / Seva Kendra & typing', desc_hi: 'एक्सेल, अस्पताल बिलिंग, आधार/सेवा केंद्र व टाइपिंग' },
  { id: 'mobile_repair', category: 'technical_trade', en: 'Mobile & Smartphone Repair', hi: 'स्मार्टफोन रिपेयरिंग', desc_en: 'Screen replacement, battery, charging port & software flashing', desc_hi: 'स्क्रीन बदलना, बैटरी, चार्जिंग जैक व सॉफ्टवेयर फ्लैशिंग' },
]

function ensureUserExists(userId: string) {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
  if (!existing) {
    const dummyPhone = `99${Date.now().toString().slice(-8)}`
    db.prepare(`
      INSERT OR IGNORE INTO users (id, phone, name, role, language)
      VALUES (?, ?, 'SkillSetu User', 'candidate', 'hi')
    `).run(userId, dummyPhone)
  }
}

// 1. GET /skills - Catalog of all available skills
profileRouter.get('/skills', (req: Request, res: Response) => {
  return res.json({ success: true, skills: SKILLS_CATALOG })
})

// 2. GET /skills/:id/questions - Fetch questions for specific skill
profileRouter.get('/skills/:id/questions', (req: Request, res: Response) => {
  const skill = req.params.id || 'tailoring'
  const questions = db.prepare('SELECT * FROM skill_questions WHERE skill_id = ?').all(skill) as any[]

  const formatted = questions.map((q) => ({
    id: q.id,
    skill_id: q.skill_id,
    level: q.level,
    scenario_en: q.scenario_en,
    scenario_hi: q.scenario_hi,
    question_en: q.question_en,
    question_hi: q.question_hi,
    options_en: JSON.parse(q.options_en_json),
    options_hi: JSON.parse(q.options_hi_json),
  }))

  return res.json({ success: true, skill, questions: formatted })
})

// 3. POST /skills/:id/answers - Evaluate answers and place at level
profileRouter.post('/skills/:id/answers', (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  ensureUserExists(userId)

  const skillId = req.params.id
  const { answers } = req.body

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers array is required', code: 'VALIDATION_ERROR' })
  }

  const questions = db.prepare('SELECT * FROM skill_questions WHERE skill_id = ?').all(skillId) as any[]
  const qMap = new Map(questions.map((q) => [q.id, q]))

  let correctCount = 0
  for (const a of answers) {
    const q = qMap.get(a.questionId)
    if (q && q.correct_answer_index === a.selectedIndex) {
      correctCount++
    }
  }

  let level: 'Beginner' | 'Intermediate' | 'Skilled' = 'Beginner'
  let feedback_en = ''
  let feedback_hi = ''

  if (correctCount >= 5) {
    level = 'Skilled'
    feedback_en = 'Outstanding! You have strong practical mastery in this craft. You are ready for high-value contracts and supervisor roles.'
    feedback_hi = 'शानदार! आपको इस हुनर की बेहतरीन व्यावहारिक समझ है। आप सीधे अच्छे पारिश्रमिक वाले काम के लिए तैयार हैं।'
  } else if (correctCount >= 3) {
    level = 'Intermediate'
    feedback_en = 'Very good! You have solid practical experience. With a few focused techniques, you can easily grow to master craftsperson.'
    feedback_hi = 'बहुत बढ़िया! आपके पास अच्छा व्यावहारिक अनुभव है। कुछ बारीकियां सीखकर आप जल्द ही मास्टर कारीगर बन सकते हैं।'
  } else {
    level = 'Beginner'
    feedback_en = 'Welcome! You have a great starting interest. Our free, step-by-step learning resources will guide you to your first paid projects!'
    feedback_hi = 'स्वागत है! आपके पास सीखने का बेहतरीन जज्बा है। हमारे निःशुल्क कोर्स आपको पहले काम तक आसानी से पहुंचाएंगे!'
  }

  db.prepare(`
    INSERT INTO user_skills (user_id, skill_id, level, quiz_score, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, skill_id) DO UPDATE SET
      level = excluded.level,
      quiz_score = excluded.quiz_score
  `).run(userId, skillId, level, correctCount)

  return res.json({
    success: true,
    skillId,
    score: correctCount,
    total: questions.length || 5,
    level,
    feedback_en,
    feedback_hi,
  })
})

// 4. PUT /profile/step/:n - Autosave onboarding step n
profileRouter.put('/step/:n', (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  ensureUserExists(userId)

  const stepNumber = parseInt(req.params.n, 10)
  const body = req.body || {}

  switch (stepNumber) {
    case 1: { // Language
      if (body.language) {
        db.prepare('UPDATE users SET language = ? WHERE id = ?').run(body.language, userId)
      }
      break
    }
    case 2: { // Basic details
      db.prepare(`
        UPDATE users SET
          name = COALESCE(?, name),
          age_range = COALESCE(?, age_range),
          gender = COALESCE(?, gender),
          village_town = COALESCE(?, village_town),
          district = COALESCE(?, district),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          nearest_city = COALESCE(?, nearest_city)
        WHERE id = ?
      `).run(
        body.name || null,
        body.age_range || null,
        body.gender || null,
        body.village_town || null,
        body.district || null,
        body.state || null,
        body.pincode || null,
        body.nearest_city || null,
        userId
      )
      break
    }
    case 3: { // Accessibility & Constraints
      db.prepare(`
        INSERT INTO access_profiles (
          user_id, mobility_limits, can_travel_km, travel_mode, wfh_only,
          available_hours, available_days, childcare_limits, has_smartphone,
          internet_quality, literacy_level, languages_spoken
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          mobility_limits = COALESCE(excluded.mobility_limits, access_profiles.mobility_limits),
          can_travel_km = COALESCE(excluded.can_travel_km, access_profiles.can_travel_km),
          travel_mode = COALESCE(excluded.travel_mode, access_profiles.travel_mode),
          wfh_only = COALESCE(excluded.wfh_only, access_profiles.wfh_only),
          available_hours = COALESCE(excluded.available_hours, access_profiles.available_hours),
          available_days = COALESCE(excluded.available_days, access_profiles.available_days),
          childcare_limits = COALESCE(excluded.childcare_limits, access_profiles.childcare_limits),
          has_smartphone = COALESCE(excluded.has_smartphone, access_profiles.has_smartphone),
          internet_quality = COALESCE(excluded.internet_quality, access_profiles.internet_quality),
          literacy_level = COALESCE(excluded.literacy_level, access_profiles.literacy_level),
          languages_spoken = COALESCE(excluded.languages_spoken, access_profiles.languages_spoken),
          updated_at = CURRENT_TIMESTAMP
      `).run(
        userId,
        body.mobility_limits ?? 'none',
        body.can_travel_km ?? 15,
        body.travel_mode ?? 'bus',
        body.wfh_only ? 1 : 0,
        body.available_hours ?? 8,
        body.available_days ?? 'Mon-Sat',
        body.childcare_limits ? 1 : 0,
        body.has_smartphone ? 1 : 0,
        body.internet_quality ?? 'good',
        body.literacy_level ?? 'basic',
        body.languages_spoken ?? 'hi,en'
      )
      break
    }
    case 4: { // Education
      db.prepare(`
        INSERT INTO access_profiles (user_id, education_level, certifications)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          education_level = COALESCE(excluded.education_level, access_profiles.education_level),
          certifications = COALESCE(excluded.certifications, access_profiles.certifications),
          updated_at = CURRENT_TIMESTAMP
      `).run(userId, body.education_level ?? '', body.certifications ?? '')
      break
    }
    case 5: { // Skills
      if (Array.isArray(body.skills)) {
        for (const s of body.skills) {
          db.prepare(`
            INSERT INTO user_skills (
              user_id, skill_id, years_exp, how_learned, what_made,
              work_style, tools_owned, monthly_income, next_goal
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, skill_id) DO UPDATE SET
              years_exp = COALESCE(excluded.years_exp, user_skills.years_exp),
              how_learned = COALESCE(excluded.how_learned, user_skills.how_learned),
              what_made = COALESCE(excluded.what_made, user_skills.what_made),
              work_style = COALESCE(excluded.work_style, user_skills.work_style),
              tools_owned = COALESCE(excluded.tools_owned, user_skills.tools_owned),
              monthly_income = COALESCE(excluded.monthly_income, user_skills.monthly_income),
              next_goal = COALESCE(excluded.next_goal, user_skills.next_goal)
          `).run(
            userId,
            s.skill_id,
            s.years_exp ?? 1,
            s.how_learned ?? 'self',
            s.what_made ?? '',
            s.work_style ?? 'alone',
            s.tools_owned ?? '',
            s.monthly_income ?? 0,
            s.next_goal ?? 'earn_more'
          )
        }
      }
      break
    }
    case 7: { // Goals
      if (body.target_role) {
        db.prepare(`
          INSERT INTO user_goals (user_id, target_role, goal_type, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(user_id) DO UPDATE SET
            target_role = excluded.target_role,
            goal_type = excluded.goal_type,
            updated_at = CURRENT_TIMESTAMP
        `).run(userId, body.target_role, body.goal_type || 'job')
      }
      break
    }
    default:
      break
  }

  return res.json({ success: true, step: stepNumber, message: `Step ${stepNumber} saved successfully` })
})

// 5. GET /profile - Fetch complete profile
profileRouter.get('/', (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any
  const access = db.prepare('SELECT * FROM access_profiles WHERE user_id = ?').get(userId) as any
  const skills = db.prepare('SELECT * FROM user_skills WHERE user_id = ?').all(userId) as any[]
  const goal = db.prepare('SELECT * FROM user_goals WHERE user_id = ?').get(userId) as any

  return res.json({
    success: true,
    user: user || { id: userId, phone: '9876543210', name: 'New User', language: 'hi' },
    accessProfile: access || {},
    skills: skills || [],
    goal: goal || { target_role: 'tailoring', goal_type: 'job' },
  })
})

// 6. PUT /profile - Update all profile sections
profileRouter.put('/', (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  ensureUserExists(userId)
  const { user, accessProfile, skills, goal } = req.body

  if (user) {
    db.prepare(`
      INSERT INTO users (id, phone, name, role, language, age_range, gender, village_town, district, state, pincode, nearest_city)
      VALUES (?, ?, ?, 'candidate', ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = COALESCE(excluded.name, users.name),
        language = COALESCE(excluded.language, users.language),
        age_range = COALESCE(excluded.age_range, users.age_range),
        gender = COALESCE(excluded.gender, users.gender),
        village_town = COALESCE(excluded.village_town, users.village_town),
        district = COALESCE(excluded.district, users.district),
        state = COALESCE(excluded.state, users.state),
        pincode = COALESCE(excluded.pincode, users.pincode),
        nearest_city = COALESCE(excluded.nearest_city, users.nearest_city)
    `).run(
      userId,
      user.phone || '9876543210',
      user.name || 'Candidate',
      user.language || 'hi',
      user.age_range || '25-35',
      user.gender || '',
      user.village_town || '',
      user.district || '',
      user.state || 'Maharashtra',
      user.pincode || '',
      user.nearest_city || ''
    )
  }

  if (accessProfile) {
    db.prepare(`
      INSERT INTO access_profiles (
        user_id, mobility_limits, can_travel_km, travel_mode, wfh_only,
        available_hours, available_days, childcare_limits, has_smartphone,
        internet_quality, literacy_level, languages_spoken, education_level,
        certifications, min_pay
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        mobility_limits = COALESCE(excluded.mobility_limits, access_profiles.mobility_limits),
        can_travel_km = COALESCE(excluded.can_travel_km, access_profiles.can_travel_km),
        travel_mode = COALESCE(excluded.travel_mode, access_profiles.travel_mode),
        wfh_only = COALESCE(excluded.wfh_only, access_profiles.wfh_only),
        available_hours = COALESCE(excluded.available_hours, access_profiles.available_hours),
        available_days = COALESCE(excluded.available_days, access_profiles.available_days),
        childcare_limits = COALESCE(excluded.childcare_limits, access_profiles.childcare_limits),
        has_smartphone = COALESCE(excluded.has_smartphone, access_profiles.has_smartphone),
        internet_quality = COALESCE(excluded.internet_quality, access_profiles.internet_quality),
        literacy_level = COALESCE(excluded.literacy_level, access_profiles.literacy_level),
        languages_spoken = COALESCE(excluded.languages_spoken, access_profiles.languages_spoken),
        education_level = COALESCE(excluded.education_level, access_profiles.education_level),
        certifications = COALESCE(excluded.certifications, access_profiles.certifications),
        min_pay = COALESCE(excluded.min_pay, access_profiles.min_pay),
        updated_at = CURRENT_TIMESTAMP
    `).run(
      userId,
      accessProfile.mobility_limits ?? 'none',
      accessProfile.can_travel_km ?? 15,
      accessProfile.travel_mode ?? 'bus',
      accessProfile.wfh_only ? 1 : 0,
      accessProfile.available_hours ?? 8,
      accessProfile.available_days ?? 'Mon-Sat',
      accessProfile.childcare_limits ? 1 : 0,
      accessProfile.has_smartphone ? 1 : 0,
      accessProfile.internet_quality ?? 'good',
      accessProfile.literacy_level ?? 'basic',
      accessProfile.languages_spoken ?? 'hi,en',
      accessProfile.education_level ?? '',
      accessProfile.certifications ?? '',
      accessProfile.min_pay ?? 10000
    )
  }

  if (Array.isArray(skills) && skills.length > 0) {
    db.prepare('DELETE FROM user_skills WHERE user_id = ?').run(userId)
    for (const s of skills) {
      db.prepare(`
        INSERT INTO user_skills (
          user_id, skill_id, years_exp, how_learned, what_made,
          work_style, tools_owned, monthly_income, next_goal, level, quiz_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        s.skill_id,
        s.years_exp ?? 1,
        s.how_learned ?? 'self',
        s.what_made ?? '',
        s.work_style ?? 'alone',
        s.tools_owned ?? '',
        s.monthly_income ?? 0,
        s.next_goal ?? 'earn_more',
        s.level ?? 'Intermediate',
        s.quiz_score ?? 4
      )
    }
  }

  if (goal && goal.target_role) {
    db.prepare(`
      INSERT INTO user_goals (user_id, target_role, goal_type, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        target_role = excluded.target_role,
        goal_type = excluded.goal_type,
        updated_at = CURRENT_TIMESTAMP
    `).run(userId, goal.target_role, goal.goal_type || 'job')
  }

  return res.json({ success: true, message: 'Profile auto-saved successfully' })
})

// Legacy / backwards-compatible aliases
profileRouter.get('/questions', (req: Request, res: Response) => {
  const skill = (req.query.skill as string) || 'tailoring'
  const questions = db.prepare('SELECT * FROM skill_questions WHERE skill_id = ?').all(skill) as any[]
  const formatted = questions.map((q) => ({
    id: q.id,
    skill_id: q.skill_id,
    level: q.level,
    scenario_en: q.scenario_en,
    scenario_hi: q.scenario_hi,
    question_en: q.question_en,
    question_hi: q.question_hi,
    options_en: JSON.parse(q.options_en_json),
    options_hi: JSON.parse(q.options_hi_json),
  }))
  return res.json({ success: true, skill, questions: formatted })
})

profileRouter.post('/evaluate-quiz', (req: Request, res: Response) => {
  const userId = req.user?.userId || 'usr_demo_1'
  ensureUserExists(userId)
  const { skillId, answers } = req.body

  if (!skillId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'skillId and answers array are required', code: 'VALIDATION_ERROR' })
  }

  const questions = db.prepare('SELECT * FROM skill_questions WHERE skill_id = ?').all(skillId) as any[]
  const qMap = new Map(questions.map((q) => [q.id, q]))

  let correctCount = 0
  for (const a of answers) {
    const q = qMap.get(a.questionId)
    if (q && q.correct_answer_index === a.selectedIndex) {
      correctCount++
    }
  }

  let level: 'Beginner' | 'Intermediate' | 'Skilled' = 'Beginner'
  let feedback_en = ''
  let feedback_hi = ''

  if (correctCount >= 5) {
    level = 'Skilled'
    feedback_en = 'Outstanding! You have strong practical mastery in this craft. You are ready for high-value contracts and supervisor roles.'
    feedback_hi = 'शानदार! आपको इस हुनर की बेहतरीन व्यावहारिक समझ है। आप सीधे अच्छे पारिश्रमिक वाले काम के लिए तैयार हैं।'
  } else if (correctCount >= 3) {
    level = 'Intermediate'
    feedback_en = 'Very good! You have solid practical experience. With a few focused techniques, you can easily grow to master craftsperson.'
    feedback_hi = 'बहुत बढ़िया! आपके पास अच्छा व्यावहारिक अनुभव है। कुछ बारीकियां सीखकर आप जल्द ही मास्टर कारीगर बन सकते हैं।'
  } else {
    level = 'Beginner'
    feedback_en = 'Welcome! You have a great starting interest. Our free, step-by-step learning resources will guide you to your first paid projects!'
    feedback_hi = 'स्वागत है! आपके पास सीखने का बेहतरीन जज्बा है। हमारे निःशुल्क कोर्स आपको पहले काम तक आसानी से पहुंचाएंगे!'
  }

  db.prepare(`
    INSERT INTO user_skills (user_id, skill_id, level, quiz_score, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, skill_id) DO UPDATE SET
      level = excluded.level,
      quiz_score = excluded.quiz_score
  `).run(userId, skillId, level, correctCount)

  return res.json({
    success: true,
    skillId,
    score: correctCount,
    total: questions.length || 5,
    level,
    feedback_en,
    feedback_hi,
  })
})
