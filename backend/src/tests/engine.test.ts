import { describe, expect, it } from 'vitest'
import {
  buildRoadmapForRole,
  filterAndRankResources,
  LearningResourceItem,
  OpportunityItem,
  rankOpportunities,
  scoreOpportunity,
} from '../engine/matching.js'

describe('SkillSetu Recommendation Engine (5.1 - Opportunity Matching)', () => {
  const sampleOpps: OpportunityItem[] = [
    {
      id: 'opp_1',
      title_en: 'Boutique Tailor',
      title_hi: 'बुटीक दर्जी',
      org: 'Roopkala',
      kind: 'job',
      skill: 'tailoring',
      area_en: 'Hadapsar',
      area_hi: 'हड़पसर',
      pay: 20000,
      hours: 8,
      mins: 15,
      cost: 20,
      work_from_home: 0,
      contact_phone: '9822000000',
      contact_whatsapp: '9822000000',
      posting_en: 'Tailor needed',
      posting_hi: 'दर्जी की आवश्यकता',
      req_skills_json: '["tailoring"]',
      req_level: 'Intermediate',
    },
    {
      id: 'opp_2',
      title_en: 'Home Garment Stitching Contractor',
      title_hi: 'घर बैठे सिलाई ठेका',
      org: 'SHG Women',
      kind: 'self_employment',
      skill: 'tailoring',
      area_en: 'Pune',
      area_hi: 'पुणे',
      pay: 15000,
      hours: 6,
      mins: 0,
      cost: 0,
      work_from_home: 1,
      contact_phone: '9822000001',
      contact_whatsapp: '9822000001',
      posting_en: 'Work from home',
      posting_hi: 'घर से काम',
      req_skills_json: '["tailoring"]',
      req_level: 'Beginner',
    },
    {
      id: 'opp_3',
      title_en: 'Handicraft & Embroidery Artisan',
      title_hi: 'हस्तशिल्प व कढ़ाई कारीगर',
      org: 'Artisans Guild',
      kind: 'gig',
      skill: 'embroidery',
      area_en: 'Junnar',
      area_hi: 'जुन्नर',
      pay: 14000,
      hours: 6,
      mins: 25,
      cost: 20,
      work_from_home: 1,
      contact_phone: '9822000002',
      contact_whatsapp: '9822000002',
      posting_en: 'Embroidery work',
      posting_hi: 'कढ़ाई का काम',
      req_skills_json: '["embroidery"]',
      req_level: 'Intermediate',
    },
    {
      id: 'opp_4',
      title_en: 'Residential Electrician',
      title_hi: 'इलेक्ट्रीशियन',
      org: 'Sai Elec',
      kind: 'job',
      skill: 'electrician',
      area_en: 'Swargate',
      area_hi: 'स्वारगेट',
      pay: 18000,
      hours: 8,
      mins: 10,
      cost: 15,
      work_from_home: 0,
      contact_phone: '9822000003',
      contact_whatsapp: '9822000003',
      posting_en: 'Electrician needed',
      posting_hi: 'इलेक्ट्रीशियन काम',
      req_skills_json: '["electrician"]',
      req_level: 'Beginner',
    },
  ]

  it('scores exact skill match higher than adjacent skill', () => {
    const userSkills = [{ skillId: 'tailoring', level: 'Intermediate' as const }]
    const profile = { canTravelKm: 15, wfhOnly: false, minPay: 15000 }

    const exactMatch = scoreOpportunity(sampleOpps[0], userSkills, profile)
    const adjacentMatch = scoreOpportunity(sampleOpps[2], userSkills, profile)

    expect(exactMatch.score).toBeGreaterThan(adjacentMatch.score)
    expect(exactMatch.reasons_en.length).toBeGreaterThan(0)
    expect(exactMatch.reasons_hi.length).toBeGreaterThan(0)
    expect(exactMatch.reasons_en[0]).toContain('Exact skill match')
  })

  it('honors work-from-home and childcare accessibility constraints', () => {
    const userSkills = [{ skillId: 'tailoring', level: 'Intermediate' as const }]
    const profile = { canTravelKm: 5, wfhOnly: true, childcareLimits: true }

    const wfhOpp = scoreOpportunity(sampleOpps[1], userSkills, profile)
    const onsiteOpp = scoreOpportunity(sampleOpps[0], userSkills, profile)

    expect(wfhOpp.score).toBeGreaterThan(onsiteOpp.score)
    expect(wfhOpp.reasons_en).toContain('100% Home-based / Work-from-home (no daily travel required).')
  })

  it('categorizes opportunities into 3 clear buckets: bestMatch, relatedSkills, nearby', () => {
    const userSkills = [{ skillId: 'tailoring', level: 'Intermediate' as const }]
    const profile = { canTravelKm: 20, wfhOnly: false }
    const goal = { targetRole: 'tailoring', goalType: 'job' as const }

    const ranked = rankOpportunities(sampleOpps, userSkills, profile, goal)

    expect(ranked.bestMatch.length).toBeGreaterThan(0)
    expect(ranked.bestMatch.every((o) => o.skill === 'tailoring')).toBe(true)
    expect(ranked.relatedSkills.some((o) => o.skill === 'embroidery')).toBe(true)
    expect(ranked.nearbyOpportunities.some((o) => o.skill === 'electrician')).toBe(true)
  })
})

describe('SkillSetu Learning Resources Engine (5.2 - Lowest Cost to Highest)', () => {
  const sampleResources: LearningResourceItem[] = [
    {
      id: 'res_1',
      title_en: 'Paid Blouse Diploma',
      title_hi: 'ब्लाउज डिप्लोमा',
      provider_en: 'Institute',
      provider_hi: 'संस्थान',
      type: 'course',
      mode: 'online',
      cost: 499,
      duration_en: '4 Weeks',
      duration_hi: '4 हफ्ते',
      level: 'Skilled',
      skill: 'tailoring',
    },
    {
      id: 'res_2',
      title_en: 'Free YouTube Blouse Cutting Tutorial',
      title_hi: 'फ्री यूट्यूब सिलाई ट्यूटोरियल',
      provider_en: 'YouTube',
      provider_hi: 'यूट्यूब',
      type: 'video',
      mode: 'online',
      cost: 0,
      duration_en: '10 Hours',
      duration_hi: '10 घंटे',
      level: 'Beginner',
      skill: 'tailoring',
    },
    {
      id: 'res_3',
      title_en: 'Low-cost ₹150 Stitching Workshop',
      title_hi: 'सिलाई वर्कशॉप',
      provider_en: 'KVK',
      provider_hi: 'केवीके',
      type: 'kvk',
      mode: 'offline',
      cost: 150,
      duration_en: '3 Days',
      duration_hi: '3 दिन',
      level: 'Beginner',
      skill: 'tailoring',
      distance_km: 12,
    },
    {
      id: 'res_4',
      title_en: 'Free Govt ITI Free Course',
      title_hi: 'सरकारी आईटीआई फ्री कोर्स',
      provider_en: 'ITI',
      provider_hi: 'आईटीआई',
      type: 'iti',
      mode: 'offline',
      cost: 0,
      duration_en: '1 Year',
      duration_hi: '1 साल',
      level: 'All',
      skill: 'tailoring',
      distance_km: 8,
    },
  ]

  it('ALWAYS orders resources from lowest cost to highest (free first)', () => {
    const result = filterAndRankResources(sampleResources, 'tailoring')

    expect(result.all.length).toBe(4)
    expect(result.all[0].cost).toBe(0)
    expect(result.all[1].cost).toBe(0)
    expect(result.all[2].cost).toBe(150)
    expect(result.all[3].cost).toBe(499)
  })

  it('splits resources cleanly into online and offline with cost ordering preserved', () => {
    const result = filterAndRankResources(sampleResources, 'tailoring')

    expect(result.online[0].cost).toBe(0)
    expect(result.online[1].cost).toBe(499)

    expect(result.offline[0].cost).toBe(0)
    expect(result.offline[1].cost).toBe(150)
  })
})

describe('SkillSetu Career Roadmap Engine (5.3 - 5 Stages)', () => {
  it('generates a complete 5-stage progressive roadmap with weekly action and scheme links', () => {
    const roadmap = buildRoadmapForRole('tailoring')

    expect(roadmap.stages.length).toBe(5)
    expect(roadmap.stages[0].stage).toBe(1)
    expect(roadmap.stages[4].stage).toBe(5)

    // Checks essential trade guidance
    expect(roadmap.stages[0].weekly_action_en).toBeDefined()
    expect(roadmap.stages[0].weekly_action_hi).toBeDefined()
    expect(roadmap.stages[0].schemes_en).toContain('PM Vishwakarma')
    expect(roadmap.stages[1].schemes_en).toContain('Mudra')
  })
})
