// SkillSetu Single Unified API Client
// All requests are routed through Vite dev proxy (/api -> backend) without hardcoded hostnames.

const API_BASE = '/api'

function getAuthHeader() {
  try {
    const token = localStorage.getItem('skillsetu-token')
    if (token) return { Authorization: `Bearer ${token}` }
  } catch (_) {}
  return {}
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let errMessage = `Request failed (status ${res.status})`
    let code = 'ERROR'
    try {
      const errData = await res.json()
      if (errData?.error) errMessage = errData.error
      if (errData?.code) code = errData.code
    } catch (_) {}
    const error = new Error(errMessage)
    error.code = code
    error.status = res.status
    throw error
  }

  return await res.json()
}

// 1. Authentication (Phone + OTP)
export async function apiSendOtp(phone) {
  return request('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

export async function apiVerifyOtp(phone, otp, language = 'hi') {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, language }),
  })
}

export async function apiGetMe() {
  return request('/me')
}

export async function apiUpdateMe(payload) {
  return request('/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

// 2. Onboarding Autosave by Step
export async function apiSaveStep(stepNumber, data) {
  return request(`/profile/step/${stepNumber}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// 3. Profile & Skills
export async function apiGetProfile() {
  return request('/profile')
}

export async function apiSaveProfile(payload) {
  return request('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function apiGetSkills() {
  return request('/skills')
}

export async function apiGetQuestions(skillId) {
  return request(`/skills/${encodeURIComponent(skillId)}/questions`)
}

export async function apiSubmitAnswers(skillId, answers) {
  return request(`/skills/${encodeURIComponent(skillId)}/answers`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

// Backwards-compatible alias for existing code
export async function apiEvaluateQuiz(skillId, answers) {
  return apiSubmitAnswers(skillId, answers)
}

// 4. Opportunities Matching & Applications
export async function apiGetOpportunities(params = {}) {
  const query = new URLSearchParams()
  if (params.kind) query.set('kind', params.kind)
  if (params.wfh !== undefined && params.wfh !== 'all') query.set('wfh', String(params.wfh))
  if (params.maxDistance) query.set('maxDistance', String(params.maxDistance))
  if (params.role) query.set('role', params.role)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request(`/opportunities${qs}`)
}

export async function apiApplyOpportunity(opportunityId, notes = '') {
  return request('/applications', {
    method: 'POST',
    body: JSON.stringify({ opportunityId, notes }),
  })
}

export async function apiGetApplied() {
  return request('/opportunities/applied')
}

// 5. Learning Resources (Online & Offline, Low to High Cost)
export async function apiGetLearningResources(params = {}) {
  const query = new URLSearchParams()
  if (params.role) query.set('role', params.role)
  if (params.mode) query.set('mode', params.mode)
  if (params.maxCost !== undefined) query.set('maxCost', String(params.maxCost))
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request(`/resources${qs}`)
}

// 6. Career Roadmap & Milestones
export async function apiGetCareerPath(role) {
  const qs = role ? `?role=${encodeURIComponent(role)}` : ''
  return request(`/career-path${qs}`)
}

// Backwards-compatible alias
export async function apiGetCareerRoadmap(role) {
  return apiGetCareerPath(role)
}

export async function apiToggleProgress(targetRole, stepNumber) {
  return request('/progress', {
    method: 'POST',
    body: JSON.stringify({ targetRole, stepNumber }),
  })
}

// Backwards-compatible alias
export async function apiToggleRoadmapStep(targetRole, stepNumber) {
  return apiToggleProgress(targetRole, stepNumber)
}

// 7. Community Peer Support
export async function apiGetCommunityStats(area) {
  const qs = area ? `?area=${encodeURIComponent(area)}` : ''
  return request(`/community${qs}`)
}

// 8. Work & Skill Video Verification (ProofPass)
export async function apiGetVerifications() {
  return request('/verification')
}

export async function apiSubmitVerification(payload) {
  return request('/verification/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function apiDeleteVerification(id) {
  return request(`/verification/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

