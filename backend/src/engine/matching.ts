// SkillSetu Deterministic, Explainable Recommendation Engines
// Covers: Opportunity Matching (5.1), Learning Resources (5.2), Career Roadmap (5.3)

export interface UserSkillInput {
  skillId: string
  level: 'Beginner' | 'Intermediate' | 'Skilled'
  yearsExp?: number
  quizScore?: number
}

export interface UserProfileInput {
  canTravelKm?: number
  travelMode?: string
  wfhOnly?: boolean
  availableHours?: number
  childcareLimits?: boolean
  literacyLevel?: string
  languages?: string[]
  minPay?: number
}

export interface UserGoalInput {
  targetRole: string
  goalType: 'job' | 'apprenticeship' | 'training' | 'wfh' | 'business'
}

export interface OpportunityItem {
  id: string
  title_en: string
  title_hi: string
  org: string
  kind: string
  skill: string
  area_en: string
  area_hi: string
  pay: number
  hours: number
  mins: number
  cost: number
  work_from_home: number
  physical_demand?: string
  contact_phone: string
  contact_whatsapp: string
  posting_en: string
  posting_hi: string
  req_skills_json: string
  req_level: string
  lat?: number
  lng?: number
}

export interface ScoredOpportunity extends OpportunityItem {
  matchScore: number
  matchBucket: 'best' | 'related' | 'nearby'
  reasons_en: string[]
  reasons_hi: string[]
  applied?: boolean
}

// Skill Adjacency Map for trades & technical skills
export const SKILL_ADJACENCY: Record<string, string[]> = {
  tailoring: ['embroidery', 'handicrafts', 'bag_making', 'fashion_design'],
  electrician: ['solar_technician', 'plumbing', 'motor_repair', 'appliance_repair'],
  plumbing: ['electrician', 'irrigation', 'pipe_fitting', 'construction'],
  carpentry: ['modular_kitchen', 'wood_turning', 'construction', 'furniture_repair'],
  cooking: ['baking', 'food_packaging', 'catering', 'service'],
  beauty: ['bridal_makeup', 'mehendi', 'hair_styling', 'nail_art'],
  driving: ['logistics', 'delivery', 'tractor_operation', 'fleet_driver'],
  webdev: ['data_entry', 'digital_marketing', 'ui_ux_design', 'graphic_design'],
  data_entry: ['webdev', 'accounting_tally', 'e_governance', 'office_admin'],
  mobile_repair: ['electrician', 'hardware_networking', 'computer_repair'],
}

export function communityStats(records: Array<{ area: string; skill: string; supply: number; demand: number }>) {
  let totalSupply = 0
  let totalDemand = 0
  const skillsMap: Record<string, { supply: number; demand: number }> = {}

  for (const r of records) {
    totalSupply += r.supply
    totalDemand += r.demand
    if (!skillsMap[r.skill]) skillsMap[r.skill] = { supply: 0, demand: 0 }
    skillsMap[r.skill].supply += r.supply
    skillsMap[r.skill].demand += r.demand
  }

  const shortages = Object.entries(skillsMap)
    .map(([skill, val]) => ({ skill, gap: val.demand - val.supply }))
    .sort((a, b) => b.gap - a.gap)

  return {
    totalSupply,
    totalDemand,
    shortages,
    records,
  }
}

// Level weights
const LEVEL_ORDER: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Skilled: 3,
}

// 5.1 OPPORTUNITY MATCHING ENGINE
export function scoreOpportunity(
  opp: OpportunityItem,
  userSkills: UserSkillInput[],
  profile: UserProfileInput,
  goal?: UserGoalInput
): { score: number; reasons_en: string[]; reasons_hi: string[] } {
  let skillScore = 0
  let isExactSkill = false
  let isAdjacentSkill = false
  const reasons_en: string[] = []
  const reasons_hi: string[] = []

  const oppSkill = opp.skill.toLowerCase()
  const primarySkill = userSkills[0]

  for (const s of userSkills) {
    const sId = s.skillId.toLowerCase()
    if (sId === oppSkill) {
      skillScore = 100
      isExactSkill = true
      reasons_en.push(`Exact skill match with your experience in ${s.skillId}.`)
      reasons_hi.push(`आपके ${s.skillId} के अनुभव से सीधा हुनर मेल खाता है।`)
      break
    } else if (SKILL_ADJACENCY[sId]?.includes(oppSkill)) {
      skillScore = Math.max(skillScore, 60)
      isAdjacentSkill = true
      reasons_en.push(`Related skill match: your experience in ${s.skillId} transfers well here.`)
      reasons_hi.push(`संबद्ध हुनर: आपका ${s.skillId} का कौशल इस काम में आसानी से काम आएगा।`)
    }
  }

  if (skillScore === 0) {
    skillScore = 30 // transferable general aptitude
    reasons_en.push('General entry-level opportunity open to learning on the job.')
    reasons_hi.push('शुरुआती स्तर का काम जिसमें काम करते हुए सीखा जा सकता है।')
  }

  // Level fit
  const userLevelNum = LEVEL_ORDER[primarySkill?.level || 'Beginner'] || 1
  const oppLevelNum = LEVEL_ORDER[opp.req_level || 'Beginner'] || 1
  let levelScore = 100
  if (userLevelNum >= oppLevelNum) {
    levelScore = 100
    reasons_en.push(`Your level (${primarySkill?.level || 'Beginner'}) is suitable for requirements.`)
    reasons_hi.push(`आपका हुनर स्तर (${primarySkill?.level || 'Beginner'}) इस काम के लिए उपयुक्त है।`)
  } else if (oppLevelNum - userLevelNum === 1) {
    levelScore = 75
    reasons_en.push('Great stepping stone to grow into intermediate responsibilities.')
    reasons_hi.push('आगे बढ़ने और नए कौशल सीखने का बढ़िया अवसर।')
  } else {
    levelScore = 50
  }

  // Commute & Location fit
  let commuteScore = 100
  if (opp.work_from_home === 1) {
    commuteScore = 100
    reasons_en.push('100% Home-based / Work-from-home (no daily travel required).')
    reasons_hi.push('100% घर बैठे काम (रोजाना आने-जाने की जरूरत नहीं)।')
  } else if (profile.wfhOnly) {
    commuteScore = 30
  } else {
    const maxTravel = profile.canTravelKm || 15
    if (opp.mins <= 20) {
      commuteScore = 100
      reasons_en.push(`Nearby location (~${opp.mins} mins travel time, bus fare ₹${opp.cost}).`)
      reasons_hi.push(`नजदीकी जगह (~${opp.mins} मिनट यात्रा समय, बस किराया ₹${opp.cost})।`)
    } else if (opp.mins <= 40) {
      commuteScore = 80
      reasons_en.push(`Reasonable commute (~${opp.mins} mins by bus/transit).`)
      reasons_hi.push(`सुविधाजनक यात्रा (~${opp.mins} मिनट बस से)।`)
    } else {
      commuteScore = Math.max(40, 100 - (opp.mins - 40) * 1.5)
    }
  }

  // Accessibility & childcare fit
  let accessibilityScore = 100
  if (profile.childcareLimits && opp.work_from_home === 1) {
    accessibilityScore = 100
    reasons_en.push('Flexible home hours fit well with childcare responsibilities.')
    reasons_hi.push('घर से काम होने के कारण बच्चों व परिवार की देखभाल के साथ मुमकिन।')
  } else if (profile.childcareLimits && opp.hours <= 6) {
    accessibilityScore = 90
    reasons_en.push(`Part-time (${opp.hours} hrs) suits your schedule.`)
    reasons_hi.push(`कम घंटे (${opp.hours} घंटे) होने से समय की सुविधा।`)
  }

  // Goal fit
  let goalScore = 75
  if (goal) {
    if (
      (goal.goalType === 'wfh' && opp.work_from_home === 1) ||
      (goal.goalType === 'job' && opp.kind === 'job') ||
      (goal.goalType === 'apprenticeship' && opp.kind === 'apprenticeship') ||
      (goal.goalType === 'business' && opp.kind === 'self_employment') ||
      (goal.goalType === 'training' && opp.kind === 'training')
    ) {
      goalScore = 100
      reasons_en.push(`Directly matches your stated goal (${goal.goalType}).`)
      reasons_hi.push(`आपके लक्ष्य (${goal.goalType}) से सीधा मेल खाता है।`)
    }
  }

  // Pay fit
  let payScore = 80
  if (opp.pay > 0 && profile.minPay && opp.pay >= profile.minPay) {
    payScore = 100
    reasons_en.push(`Income (₹${opp.pay.toLocaleString('en-IN')}/mo) meets or exceeds your requirement.`)
    reasons_hi.push(`आय (₹${opp.pay.toLocaleString('en-IN')}/माह) आपकी अपेक्षा के अनुसार है।`)
  }

  const finalScore = Math.round(
    skillScore * 0.35 +
    levelScore * 0.15 +
    commuteScore * 0.15 +
    accessibilityScore * 0.15 +
    goalScore * 0.10 +
    payScore * 0.05 +
    5
  )

  return {
    score: Math.min(100, Math.max(10, finalScore)),
    reasons_en,
    reasons_hi,
  }
}

export function rankOpportunities(
  opportunities: OpportunityItem[],
  userSkills: UserSkillInput[],
  profile: UserProfileInput,
  goal?: UserGoalInput
): {
  bestMatch: ScoredOpportunity[]
  relatedSkills: ScoredOpportunity[]
  nearbyOpportunities: ScoredOpportunity[]
} {
  const scored = opportunities.map((opp) => {
    const { score, reasons_en, reasons_hi } = scoreOpportunity(opp, userSkills, profile, goal)
    return {
      ...opp,
      matchScore: score,
      reasons_en,
      reasons_hi,
      matchBucket: 'best' as const,
    }
  })

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore)

  const primarySkill = userSkills[0]?.skillId?.toLowerCase() || ''

  const bestMatch: ScoredOpportunity[] = []
  const relatedSkills: ScoredOpportunity[] = []
  const nearbyOpportunities: ScoredOpportunity[] = []

  for (const s of scored) {
    const oppSkill = s.skill.toLowerCase()
    if (oppSkill === primarySkill) {
      bestMatch.push({ ...s, matchBucket: 'best' })
    } else if (SKILL_ADJACENCY[primarySkill]?.includes(oppSkill)) {
      relatedSkills.push({ ...s, matchBucket: 'related' })
    } else {
      nearbyOpportunities.push({ ...s, matchBucket: 'nearby' })
    }
  }

  // Sort nearby by shortest commute minutes
  nearbyOpportunities.sort((a, b) => a.mins - b.mins)

  return {
    bestMatch,
    relatedSkills,
    nearbyOpportunities,
  }
}

// 5.2 LEARNING RESOURCES ENGINE (Ordered lowest cost to highest, free first)
export interface LearningResourceItem {
  id: string
  title_en: string
  title_hi: string
  provider_en: string
  provider_hi: string
  type: string
  mode: 'online' | 'offline'
  cost: number
  duration_en: string
  duration_hi: string
  level: string
  skill: string
  language?: string
  link?: string
  address_en?: string
  address_hi?: string
  distance_km?: number
  badge_en?: string
  badge_hi?: string
}

export function filterAndRankResources(
  resources: LearningResourceItem[],
  targetRole: string,
  userLevel: string = 'Beginner',
  modeFilter: 'all' | 'online' | 'offline' = 'all',
  maxCost: number = 100000
): { online: LearningResourceItem[]; offline: LearningResourceItem[]; all: LearningResourceItem[]; freeCount: number } {
  const roleLower = targetRole.toLowerCase()

  const filtered = resources.filter((r) => {
    const skillMatch = r.skill.toLowerCase() === roleLower || r.skill === 'all'
    const costMatch = r.cost <= maxCost
    const modeMatch = modeFilter === 'all' || r.mode === modeFilter
    return skillMatch && costMatch && modeMatch
  })

  // ALWAYS ORDER FROM LOWEST COST TO HIGHEST COST (free first = 0 cost)
  filtered.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost
    // If same cost, prefer online or lower distance
    if (a.distance_km && b.distance_km) return a.distance_km - b.distance_km
    return 0
  })

  const online = filtered.filter((r) => r.mode === 'online')
  const offline = filtered.filter((r) => r.mode === 'offline')

  return {
    online,
    offline,
    all: filtered,
    freeCount: filtered.filter((r) => r.cost === 0).length,
  }
}

// 5.3 CAREER PATH ENGINE
export interface RoadmapStage {
  stage: number
  title_en: string
  title_hi: string
  what_to_learn_en: string
  what_to_learn_hi: string
  what_to_practise_en: string
  what_to_practise_hi: string
  estimated_time_en: string
  estimated_time_hi: string
  income_range_en: string
  income_range_hi: string
  tools_needed_en: string
  tools_needed_hi: string
  weekly_action_en: string
  weekly_action_hi: string
  resource_ids: string[]
  business_tips_en: string
  business_tips_hi: string
  schemes_en: string
  schemes_hi: string
}

export interface CareerRoadmapResult {
  targetRole: string
  title_en: string
  title_hi: string
  currentStage: number
  stages: RoadmapStage[]
  adjacentRoles: Array<{ role: string; title_en: string; title_hi: string }>
}

export function buildRoadmapForRole(
  targetRole: string,
  rawRoadmapRow?: { stages_json: string; adjacent_roles_json: string; title_en: string; title_hi: string },
  completedSteps: number[] = []
): CareerRoadmapResult {
  if (rawRoadmapRow) {
    try {
      const stages: RoadmapStage[] = JSON.parse(rawRoadmapRow.stages_json)
      const adjacentRoles = JSON.parse(rawRoadmapRow.adjacent_roles_json)
      const completedCount = completedSteps.length
      const currentStage = Math.min(5, Math.max(1, Math.floor(completedCount / 2) + 1))
      return {
        targetRole,
        title_en: rawRoadmapRow.title_en,
        title_hi: rawRoadmapRow.title_hi,
        currentStage,
        stages,
        adjacentRoles,
      }
    } catch (e) {
      console.error('Error parsing roadmap json', e)
    }
  }

  // Fallback generic 5-stage roadmap for any role
  return {
    targetRole,
    title_en: `${targetRole.toUpperCase()} Career Growth Roadmap`,
    title_hi: `${targetRole} करियर प्रगति रोडमैप`,
    currentStage: 1,
    stages: [
      {
        stage: 1,
        title_en: 'Stage 1: Foundation (सीखने की शुरुआत)',
        title_hi: 'चरण 1: बुनियादी ज्ञान व औजारों की समझ',
        what_to_learn_en: 'Core concepts, safety rules, and essential tools.',
        what_to_learn_hi: 'मूल बातें, सुरक्षा नियम और बुनियादी औजार।',
        what_to_practise_en: 'Small daily tasks with precision.',
        what_to_practise_hi: 'रोजाना छोटे अभ्यास कार्य करना।',
        estimated_time_en: '2 to 4 Weeks',
        estimated_time_hi: '2 से 4 हफ्ते',
        income_range_en: '₹3,000 - ₹6,000 / mo',
        income_range_hi: '₹3,000 - ₹6,000 / माह',
        tools_needed_en: 'Basic hand tools and starter guide.',
        tools_needed_hi: 'शुरुआती औजार व गाइड।',
        weekly_action_en: 'Complete 1 free introductory tutorial and practice for 30 minutes daily.',
        weekly_action_hi: '1 मुफ्त ट्यूटोरियल पूरा करें और रोज 30 मिनट अभ्यास करें।',
        resource_ids: [],
        business_tips_en: 'Tell 5 friends and family about your new service.',
        business_tips_hi: 'अपने 5 परिचितों को अपनी नई सेवा के बारे में बताएं।',
        schemes_en: 'PM Vishwakarma Toolkit Voucher Scheme',
        schemes_hi: 'पीएम विश्वकर्मा टूलकिट वाउचर योजना',
      },
      {
        stage: 2,
        title_en: 'Stage 2: Practice (हुनर में निपुणता)',
        title_hi: 'चरण 2: व्यावहारिक अभ्यास और स्पीड',
        what_to_learn_en: 'Advanced techniques, faster delivery, and defect fixing.',
        what_to_learn_hi: 'उन्नत तकनीक, तेजी से काम और गलतियां सुधारना।',
        what_to_practise_en: 'Complete 10 real projects or sample tasks.',
        what_to_practise_hi: '10 असली काम या सैंपल पूरे करें।',
        estimated_time_en: '1 to 2 Months',
        estimated_time_hi: '1 से 2 महीने',
        income_range_en: '₹10,000 - ₹18,000 / mo',
        income_range_hi: '₹10,000 - ₹18,000 / माह',
        tools_needed_en: 'Professional standard kit.',
        tools_needed_hi: 'मानक पेशेवर टूल्स।',
        weekly_action_en: 'Create a WhatsApp Business catalog with clear photos and rates.',
        weekly_action_hi: 'व्हाट्सऐप बिजनेस कैटलॉग बनाकर फोटो और रेट डालें।',
        resource_ids: [],
        business_tips_en: 'Collect reviews from your first 3 happy customers.',
        business_tips_hi: 'पहले 3 ग्राहकों से रिव्यु और फीडबैक लें।',
        schemes_en: 'PM Mudra Shishu Loan (up to ₹50,000)',
        schemes_hi: 'प्रधानमंत्री मुद्रा शिशु ऋण (₹50,000 तक)',
      },
      {
        stage: 3,
        title_en: 'Stage 3: Earn (पहला पक्का काम)',
        title_hi: 'चरण 3: नियमित ग्राहक व पक्की कमाई',
        what_to_learn_en: 'Customer negotiation, invoicing, and punctuality.',
        what_to_learn_hi: 'ग्राहक से बातचीत, हिसाब-किताब और समय की पाबंदी।',
        what_to_practise_en: 'Deliver consistently on time.',
        what_to_practise_hi: 'हमेशा तय समय पर काम पूरा करके दें।',
        estimated_time_en: '2 to 4 Months',
        estimated_time_hi: '2 से 4 महीने',
        income_range_en: '₹18,000 - ₹28,000 / mo',
        income_range_hi: '₹18,000 - ₹28,000 / माह',
        tools_needed_en: 'Semi-automatic or commercial tools.',
        tools_needed_hi: 'अर्ध-स्वचालित या कमर्शियल मशीनें।',
        weekly_action_en: 'Approach 3 local contractors or institutions for overflow work.',
        weekly_action_hi: 'आसपास के ठेकेदारों से मिलकर अतिरिक्त काम लें।',
        resource_ids: [],
        business_tips_en: 'Keep 10% emergency buffer from every payment.',
        business_tips_hi: 'हर कमाई में से 10% आपातकालीन बचत में अलग रखें।',
        schemes_en: 'MSRLM Self-Help Group Microcredit',
        schemes_hi: 'राज्य ग्रामीण आजीविका मिशन सूक्ष्म ऋण',
      },
      {
        stage: 4,
        title_en: 'Stage 4: Grow (दुकान व टीम)',
        title_hi: 'चरण 4: विस्तार, टीम और बड़ा काम',
        what_to_learn_en: 'Team management, bulk purchasing, quality inspection.',
        what_to_learn_hi: 'टीम संभालना, थोक में सामान खरीदना, क्वालिटी चेक।',
        what_to_practise_en: 'Manage 2 apprentices or helpers.',
        what_to_practise_hi: '1-2 सहायकों को काम सिखाएं और साथ जोड़ें।',
        estimated_time_en: '6 to 12 Months',
        estimated_time_hi: '6 से 12 महीने',
        income_range_en: '₹30,000 - ₹55,000 / mo',
        income_range_hi: '₹30,000 - ₹55,000 / माह',
        tools_needed_en: 'Commercial workshop equipment.',
        tools_needed_hi: 'पूर्ण वर्कशॉप उपकरण।',
        weekly_action_en: 'Share customer testimonials on social media and WhatsApp groups.',
        weekly_action_hi: 'संतुष्ट ग्राहकों की बातें सोशल मीडिया पर साझा करें।',
        resource_ids: [],
        business_tips_en: 'Offer annual service contracts for recurring monthly income.',
        business_tips_hi: 'मंथली मेंटेनेंस कॉन्ट्रैक्ट से पक्की आय बनाएं।',
        schemes_en: 'PMEGP 25-35% Government Subsidy Scheme',
        schemes_hi: 'पीएमईजीपी 25-35% सरकारी सब्सिडी योजना',
      },
      {
        stage: 5,
        title_en: 'Stage 5: Master / Enterprise (ब्रांड व लीडरशिप)',
        title_hi: 'चरण 5: स्वतंत्र व्यवसाय, ब्रांड व मेंटरशिप',
        what_to_learn_en: 'Branding, official licensing, government tenders, mentoring.',
        what_to_learn_hi: 'ब्रांड बनाना, सरकारी टेंडर, ऑफिशियल लाइसेंस, दूसरों को सिखाना।',
        what_to_practise_en: 'Run an independent sustainable enterprise.',
        what_to_practise_hi: 'स्वतंत्र सफल उद्यम चलाना।',
        estimated_time_en: '1 to 2 Years',
        estimated_time_hi: '1 से 2 साल',
        income_range_en: '₹60,000 - ₹1,20,000+ / mo',
        income_range_hi: '₹60,000 - ₹1,20,000+ / माह',
        tools_needed_en: 'Full registered business setup.',
        tools_needed_hi: 'पंजीकृत बिजनेस सेटअप।',
        weekly_action_en: 'Register on Udyam Portal (MSME) for government subsidies.',
        weekly_action_hi: 'उद्यम आधार (MSME) पर मुफ्त रजिस्ट्रेशन करें।',
        resource_ids: [],
        business_tips_en: 'Help 5 beginners in your community get started in your trade.',
        business_tips_hi: 'अपने समुदाय के 5 युवाओं को हुनर सीखने में मदद करें।',
        schemes_en: 'Stand-Up India Scheme',
        schemes_hi: 'स्टैंड-अप इंडिया योजना',
      },
    ],
    adjacentRoles: [
      { role: 'trainer', title_en: 'Vocational Skill Trainer', title_hi: 'कौशल प्रशिक्षक' },
      { role: 'supervisor', title_en: 'Site Supervisor', title_hi: 'साइट सुपरवाइजर' },
    ],
  }
}
