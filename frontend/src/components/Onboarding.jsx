import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiEvaluateQuiz, apiGetProfile, apiGetQuestions, apiSaveProfile, apiSaveStep, apiSendOtp, apiVerifyOtp } from '../api.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { GoalIcon, TradeIcon } from './TradeIcons.jsx'
import { DashIcon } from './DashboardIcons.jsx'
import { scroller } from '../lib.js'

const AVAILABLE_SKILLS = [
  { id: 'tailoring', en: 'Stitching & Tailoring', hi: 'सिलाई व बुटीक कार्य' },
  { id: 'electrician', en: 'Electrician & Solar', hi: 'इलेक्ट्रीशियन व सोलर' },
  { id: 'plumbing', en: 'Plumbing & Piping', hi: 'प्लंबिंग व नल-फिटिंग' },
  { id: 'carpentry', en: 'Carpentry & Woodwork', hi: 'बढ़ई व लकड़ी का काम' },
  { id: 'cooking', en: 'Cooking & Tiffin Service', hi: 'रसोई व टिफिन सेवा' },
  { id: 'beauty', en: 'Beauty Parlour & Salon', hi: 'ब्यूटी पार्लर व मेकअप' },
  { id: 'driving', en: 'Driving & Transport', hi: 'ड्राइविंग व ट्रांसपोर्ट' },
  { id: 'webdev', en: 'Web Development', hi: 'वेबसाइट व कोडिंग' },
  { id: 'data_entry', en: 'Data Entry & Computer', hi: 'डेटा एंट्री व कंप्यूटर' },
  { id: 'mobile_repair', en: 'Mobile & Phone Repair', hi: 'मोबाइल रिपेयरिंग' },
]

export default function Onboarding() {
  const { lang, setLanguage, t, speak, isSpeaking } = useLanguage()
  const navigate = useNavigate()

  // Current wizard step: 1 to 7
  const [step, setStep] = useState(1)
  const stepHeadingRef = useRef(null)

  // Onboarding state with auto-save to localStorage
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('skillsetu-onboarding')
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return {
      language: lang || 'hi',
      user: {
        name: '',
        phone: '',
        age_range: '26-35',
        gender: '',
        village_town: '',
        district: '',
        state: '',
        pincode: '',
        nearest_city: '',
      },
      accessProfile: {
        can_travel_km: 15,
        travel_mode: 'bus',
        wfh_only: false,
        available_hours: 8,
        available_days: 'Mon-Sat',
        childcare_limits: false,
        has_smartphone: true,
        internet_quality: 'good',
        literacy_level: 'basic',
        languages_spoken: 'hi,mr,en',
        education_level: '10th Pass',
        certifications: '',
      },
      selectedSkills: ['tailoring'],
      skillDetails: {
        tailoring: {
          years_exp: 2,
          how_learned: 'family',
          what_made: '',
          work_style: 'alone',
          tools_owned: '',
          monthly_income: 6000,
          next_goal: 'earn_more',
          level: 'Beginner',
        },
      },
      quizAnswers: {},
      quizEvaluations: {},
      goal: {
        target_role: 'tailoring',
        goal_type: 'job',
      },
    }
  })

  // Quiz questions state
  const [activeQuizSkill, setActiveQuizSkill] = useState('tailoring')
  const [skillQuestions, setSkillQuestions] = useState([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizFeedback, setQuizFeedback] = useState(null)
  const [skillSearch, setSkillSearch] = useState('')
  const [isListeningMic, setIsListeningMic] = useState(false)

  // Mobile & OTP state for Step 2
  const [phoneVerified, setPhoneVerified] = useState(() => {
    try {
      const userStr = localStorage.getItem('skillsetu-user')
      if (userStr) {
        const u = JSON.parse(userStr)
        if (u?.phone) return true
      }
    } catch (_) {}
    return false
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('')
  const [stepError, setStepError] = useState('')

  const handleSendOtp = async () => {
    const rawPhone = (formData.user.phone || '').replace(/\D/g, '')
    if (rawPhone.length < 10) {
      setOtpError(lang === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.')
      return
    }
    setOtpSending(true)
    setOtpError('')
    setOtpSuccessMessage('')
    try {
      const res = await apiSendOtp(rawPhone)
      setOtpSent(true)
      setOtpSuccessMessage(
        res?.message ||
          (lang === 'hi'
            ? `ओटीपी ${rawPhone} पर भेजा गया! (डेमो कोड: 123456)`
            : `OTP sent to ${rawPhone}! (Demo code: 123456)`)
      )
    } catch (err) {
      setOtpError(err?.message || (lang === 'hi' ? 'ओटीपी भेजने में विफलता। पुनः प्रयास करें।' : 'Failed to send OTP. Please try again.'))
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    const rawPhone = (formData.user.phone || '').replace(/\D/g, '')
    const cleanOtp = (otpCode || '').trim()
    if (cleanOtp.length < 4) {
      setOtpError(lang === 'hi' ? 'कृपया सही ओटीपी दर्ज करें।' : 'Please enter the OTP.')
      return
    }
    setOtpVerifying(true)
    setOtpError('')
    try {
      const res = await apiVerifyOtp(rawPhone, cleanOtp, lang)
      if (res?.token) {
        localStorage.setItem('skillsetu-token', res.token)
        const updatedUser = {
          ...(res.user || {}),
          name: formData.user.name || res.user?.name || 'SkillSetu User',
          phone: rawPhone,
        }
        localStorage.setItem('skillsetu-user', JSON.stringify(updatedUser))
        window.dispatchEvent(new Event('auth-change'))
        setPhoneVerified(true)
        setOtpSuccessMessage(
          lang === 'hi'
            ? '✓ मोबाइल नंबर सफलतापूर्वक सत्यापित हुआ!'
            : '✓ Mobile number successfully verified!'
        )
        setStepError('')
      } else {
        setOtpError(lang === 'hi' ? 'ओटीपी अमान्य है।' : 'Invalid OTP code.')
      }
    } catch (err) {
      setOtpError(err?.message || (lang === 'hi' ? 'ओटीपी सत्यापन विफल हुआ।' : 'Failed to verify OTP.'))
    } finally {
      setOtpVerifying(false)
    }
  }

  // Auto-save locally and optionally to backend
  useEffect(() => {
    try {
      localStorage.setItem('skillsetu-onboarding', JSON.stringify(formData))
    } catch (_) {}

    // Auto-save to backend if logged in
    const token = localStorage.getItem('skillsetu-token')
    if (token) {
      const skillsArray = formData.selectedSkills.map((sId) => ({
        skill_id: sId,
        ...(formData.skillDetails[sId] || {}),
        level: formData.quizEvaluations[sId]?.level || formData.skillDetails[sId]?.level || 'Beginner',
        quiz_score: formData.quizEvaluations[sId]?.score || 0,
      }))

      apiSaveProfile({
        user: { ...formData.user, language: lang },
        accessProfile: formData.accessProfile,
        skills: skillsArray,
        goal: formData.goal,
      }).catch(() => {})
    }
  }, [formData, lang])

  // Load existing profile from backend on mount if available (only if authenticated)
  useEffect(() => {
    const token = localStorage.getItem('skillsetu-token')
    if (!token) return

    apiGetProfile()
      .then((res) => {
        if (res?.authenticated && res?.user) {
          if (res.user.phone) {
            setPhoneVerified(true)
          }
          setFormData((prev) => ({
            ...prev,
            user: { ...prev.user, ...res.user },
            accessProfile: { ...prev.accessProfile, ...(res.accessProfile || {}) },
            goal: res.goal || prev.goal,
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Load practical quiz questions when reaching step 6
  useEffect(() => {
    if (step === 6) {
      const target = formData.selectedSkills[0] || 'tailoring'
      setActiveQuizSkill(target)
      loadQuiz(target)
    }
  }, [step, formData.selectedSkills])

  const loadQuiz = async (skillId) => {
    setQuizLoading(true)
    setQuizFeedback(null)
    try {
      const res = await apiGetQuestions(skillId)
      if (res?.questions) {
        setSkillQuestions(res.questions)
      }
    } catch (err) {
      console.error('Failed to load quiz questions', err)
    } finally {
      setQuizLoading(false)
    }
  }

  // Voice to text for What Made input
  const startSpeechRecognition = (skillId) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert(lang === 'hi' ? 'आपके ब्राउजर में माइक्रोफोन वॉइस सपोर्ट नहीं है।' : 'Speech recognition not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = false

    recognition.onstart = () => setIsListeningMic(true)
    recognition.onend = () => setIsListeningMic(false)
    recognition.onerror = () => setIsListeningMic(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      updateSkillDetail(skillId, 'what_made', (formData.skillDetails[skillId]?.what_made || '') + ' ' + transcript)
    }

    recognition.start()
  }

  const scrollToStepTop = () => {
    if (scroller.lenis) {
      scroller.lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo(0, 0)
    }
    setTimeout(() => {
      stepHeadingRef.current?.focus()
    }, 50)
  }

  const handleNext = () => {
    // Step 2 Validation: Candidate Name, Mobile Number and OTP verification
    if (step === 2) {
      if (!formData.user.name?.trim()) {
        setStepError(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.')
        return
      }
      const rawPhone = (formData.user.phone || '').replace(/\D/g, '')
      if (rawPhone.length < 10) {
        setStepError(lang === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.')
        return
      }
      if (!phoneVerified) {
        setStepError(
          lang === 'hi'
            ? 'कृपया ओटीपी जनरेट करें और आगे बढ़ने से पहले मोबाइल नंबर सत्यापित करें।'
            : 'Please generate OTP and verify your mobile number before proceeding.'
        )
        return
      }
      if (!formData.user.village_town?.trim()) {
        setStepError(lang === 'hi' ? 'कृपया अपना गांव या कस्बा दर्ज करें।' : 'Please enter your village or town.')
        return
      }
      setStepError('')
    } else {
      setStepError('')
    }

    // Autosave current step data to backend
    apiSaveStep(step, {
      user: formData.user,
      accessProfile: formData.accessProfile,
      selectedSkills: formData.selectedSkills,
      skillDetails: formData.skillDetails,
      goal: formData.goal,
    }).catch(() => {})

    if (step < 7) {
      setStep(step + 1)
      scrollToStepTop()
    } else {
      // Finished Onboarding!
      try {
        localStorage.setItem('skillsetu-completed', 'true')
        localStorage.setItem('skillsetu-onboarding', JSON.stringify(formData))
        localStorage.setItem('skillsetu-user', JSON.stringify(formData.user))
        localStorage.setItem('skillsetu-profile', JSON.stringify(formData))
      } catch (_) {}
      navigate('/dashboard')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      scrollToStepTop()
    }
  }

  const updateSkillDetail = (skillId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      skillDetails: {
        ...prev.skillDetails,
        [skillId]: {
          ...(prev.skillDetails[skillId] || {}),
          [field]: value,
        },
      },
    }))
  }

  const toggleSkillSelect = (skillId) => {
    setFormData((prev) => {
      const exists = prev.selectedSkills.includes(skillId)
      const newSkills = exists
        ? prev.selectedSkills.filter((s) => s !== skillId)
        : [...prev.selectedSkills, skillId]

      return {
        ...prev,
        selectedSkills: newSkills.length ? newSkills : [skillId],
        goal: { ...prev.goal, target_role: newSkills[0] || skillId },
        skillDetails: {
          ...prev.skillDetails,
          [skillId]: prev.skillDetails[skillId] || {
            years_exp: 1,
            how_learned: 'self',
            what_made: '',
            work_style: 'alone',
            tools_owned: '',
            monthly_income: 0,
            next_goal: 'earn_more',
            level: 'Beginner',
          },
        },
      }
    })
  }

  const handleSelectQuizAnswer = (qId, optionIdx) => {
    setFormData((prev) => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [activeQuizSkill]: {
          ...(prev.quizAnswers[activeQuizSkill] || {}),
          [qId]: optionIdx,
        },
      },
    }))
  }

  const submitQuiz = async () => {
    const answersObj = formData.quizAnswers[activeQuizSkill] || {}
    const answersArray = Object.entries(answersObj).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }))

    try {
      const res = await apiEvaluateQuiz(activeQuizSkill, answersArray)
      setQuizFeedback(res)
      setFormData((prev) => ({
        ...prev,
        quizEvaluations: {
          ...prev.quizEvaluations,
          [activeQuizSkill]: res,
        },
        skillDetails: {
          ...prev.skillDetails,
          [activeQuizSkill]: {
            ...(prev.skillDetails[activeQuizSkill] || {}),
            level: res.level,
          },
        },
      }))
    } catch (err) {
      console.error('Quiz evaluation error', err)
    }
  }

  // Audio readout for current screen
  const speakCurrentScreen = () => {
    let text = ''
    if (step === 1) {
      text =
        lang === 'hi'
          ? 'चरण एक: अपनी पसंदीदा भाषा चुनें। अंग्रेजी या हिंदी में से किसी एक कार्ड पर टैप करें।'
          : 'Step one: Choose your language. Tap English or Hindi card to continue.'
    } else if (step === 2) {
      text =
        lang === 'hi'
          ? 'चरण दो: बुनियादी जानकारी। अपना नाम, उम्र, गांव या कस्बा दर्ज करें।'
          : 'Step two: Basic details. Enter your name, age group, and village or town.'
    } else if (step === 3) {
      text =
        lang === 'hi'
          ? 'चरण तीन: सफर और सुविधा। आप कितनी दूर तक सफर कर सकते हैं या क्या आपको घर से ही काम करना है?'
          : 'Step three: Travel and accessibility preferences. How far can you commute or do you prefer home-based work?'
    } else if (step === 4) {
      text =
        lang === 'hi'
          ? 'चरण चार: शिक्षा व पृष्ठभूमि। यह वैकल्पिक है, कोई डिग्री जरूरी नहीं है।'
          : 'Step four: Education and background. This is optional; no formal degree is required.'
    } else if (step === 5) {
      text =
        lang === 'hi'
          ? 'चरण पांच: अपने हुनर चुनें। सिलाई, इलेक्ट्रीशियन, प्लंबिंग, ड्राइविंग या कंप्यूटर काम चुनें।'
          : 'Step five: Select your skills and trades. Choose tailoring, electrician, plumbing, driving, or tech.'
    } else if (step === 6) {
      text =
        lang === 'hi'
          ? 'चरण छह: पांच व्यावहारिक सवाल। इसमें कोई फेल नहीं होता, यह आपको सही स्तर पर रखने के लिए है।'
          : 'Step six: Practical placement quiz. Answer 5 scenarios to place you at the right skill level.'
    } else if (step === 7) {
      text =
        lang === 'hi'
          ? 'चरण सात: आपका अगला लक्ष्य क्या है? नौकरी, अप्रेंटिसशिप, कोर्स ट्रेनिंग या स्वरोजगार चुनें।'
          : 'Step seven: What is your goal? Pick job, apprenticeship, course training, or self-employment.'
    }
    speak(text)
  }

  const filteredSkills = AVAILABLE_SKILLS.filter(
    (s) =>
      s.en.toLowerCase().includes(skillSearch.toLowerCase()) ||
      s.hi.includes(skillSearch) ||
      s.id.includes(skillSearch.toLowerCase())
  )

  return (
    <main id="main" className="onboarding-page w">
      {/* Top Wizard Progress Bar */}
      <div className="wizard-progress-card">
        <div className="wizard-progress-header">
          <span className="wizard-step-label">{t('onboarding.stepOf', { current: step, total: 7 })}</span>
          <button
            type="button"
            className="btn-icon-listen"
            onClick={speakCurrentScreen}
            title={t('onboarding.listenScreen')}
            aria-label={t('onboarding.listenScreen')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            {t('onboarding.listenScreen')}
          </button>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }} />
        </div>
      </div>

      <div className="wizard-step-container">
        {/* ================= STEP 1: LANGUAGE ================= */}
        {step === 1 && (
          <section className="wizard-screen">
            <h2 className="screen-title" tabIndex={-1} ref={stepHeadingRef}>{t('onboarding.langTitle')}</h2>
            <p className="screen-sub">{t('onboarding.langSubtitle')}</p>

            <div className="lang-big-cards-grid">
              <div
                className={`lang-big-card ${lang === 'hi' ? 'selected' : ''}`}
                onClick={() => {
                  setLanguage('hi')
                  setFormData((p) => ({ ...p, language: 'hi' }))
                }}
                role="button"
                tabIndex={0}
              >
                <div className="lang-card-symbol">अ</div>
                <div className="lang-card-text">
                  <h3>हिन्दी (Hindi)</h3>
                  <p>आसान हिंदी में काम और ट्रेनिंग खोजें</p>
                </div>
                {lang === 'hi' && (
                  <span className="check-badge">
                    <DashIcon name="check" size={14} />
                  </span>
                )}
              </div>

              <div
                className={`lang-big-card ${lang === 'en' ? 'selected' : ''}`}
                onClick={() => {
                  setLanguage('en')
                  setFormData((p) => ({ ...p, language: 'en' }))
                }}
                role="button"
                tabIndex={0}
              >
                <div className="lang-card-symbol">A</div>
                <div className="lang-card-text">
                  <h3>English</h3>
                  <p>Explore trades, jobs and course learning in English</p>
                </div>
                {lang === 'en' && (
                  <span className="check-badge">
                    <DashIcon name="check" size={14} />
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================= STEP 2: BASIC DETAILS & MOBILE OTP ================= */}
        {step === 2 && (
          <section className="wizard-screen">
            <h2 className="screen-title" tabIndex={-1} ref={stepHeadingRef}>{t('onboarding.basicTitle')}</h2>
            <p className="screen-sub">{t('onboarding.basicSubtitle')}</p>

            {stepError && (
              <div className="step-validation-banner" role="alert">
                <DashIcon name="alert" size={18} />
                <span>{stepError}</span>
              </div>
            )}

            <div className="form-grid-2">
              <label className="input-group full-width">
                <span>{t('onboarding.fullName')} *</span>
                <input
                  type="text"
                  className="base-input"
                  placeholder={t('onboarding.namePlaceholder')}
                  value={formData.user.name}
                  onChange={(e) => {
                    setStepError('')
                    setFormData((p) => ({
                      ...p,
                      user: { ...p.user, name: e.target.value },
                    }))
                  }}
                  required
                />
              </label>

              {/* Mobile Number & OTP Verification Card */}
              <div className="mobile-otp-card full-width">
                <div className="mobile-otp-header">
                  <div className="mobile-otp-title-wrap">
                    <DashIcon name="phone" size={18} className="otp-icon" />
                    <strong>{lang === 'hi' ? 'मोबाइल नंबर और ओटीपी सत्यापन' : 'Mobile Number & OTP Verification'} *</strong>
                  </div>
                  {phoneVerified && (
                    <span className="badge-verified-inline">
                      <DashIcon name="check" size={14} /> {lang === 'hi' ? 'मोबाइल सत्यापित' : 'Mobile Verified'}
                    </span>
                  )}
                </div>

                <div className="mobile-input-row">
                  <div className="phone-prefix-wrap">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      className="base-input phone-input"
                      placeholder="9876543210"
                      maxLength={10}
                      value={formData.user.phone || ''}
                      disabled={phoneVerified}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setStepError('')
                        setOtpError('')
                        setFormData((p) => ({
                          ...p,
                          user: { ...p.user, phone: val },
                        }))
                      }}
                    />
                  </div>

                  {!phoneVerified ? (
                    <button
                      type="button"
                      className="btn-otp-action"
                      onClick={handleSendOtp}
                      disabled={otpSending || (formData.user.phone || '').length < 10}
                    >
                      {otpSending
                        ? (lang === 'hi' ? 'भेजा जा रहा है...' : 'Sending...')
                        : otpSent
                        ? (lang === 'hi' ? 'ओटीपी पुनः भेजें (Resend)' : 'Resend OTP')
                        : (lang === 'hi' ? 'ओटीपी जनरेट करें (Generate OTP)' : 'Generate OTP')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-change-number"
                      onClick={() => {
                        setPhoneVerified(false)
                        setOtpSent(false)
                        setOtpCode('')
                        setOtpSuccessMessage('')
                      }}
                    >
                      {lang === 'hi' ? 'नंबर बदलें' : 'Change Number'}
                    </button>
                  )}
                </div>

                {otpSuccessMessage && (
                  <p className="otp-helper-msg success">
                    {otpSuccessMessage}
                  </p>
                )}

                {otpError && (
                  <p className="otp-helper-msg error" role="alert">
                    ⚠️ {otpError}
                  </p>
                )}

                {/* If OTP generated and not yet verified: show 6-digit verification code entry */}
                {otpSent && !phoneVerified && (
                  <div className="otp-verification-panel">
                    <label className="otp-code-label">
                      <span>{lang === 'hi' ? 'प्राप्त 6 अंकों का ओटीपी दर्ज करें:' : 'Enter 6-digit OTP code:'}</span>
                      <div className="otp-verify-row">
                        <input
                          type="tel"
                          maxLength={6}
                          placeholder="123456"
                          className="base-input otp-code-input"
                          value={otpCode}
                          onChange={(e) => {
                            setOtpError('')
                            setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }}
                        />
                        <button
                          type="button"
                          className="btn-verify-otp-submit"
                          onClick={handleVerifyOtp}
                          disabled={otpVerifying || otpCode.length < 4}
                        >
                          {otpVerifying
                            ? (lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...')
                            : (lang === 'hi' ? 'सत्यापित करें (Verify OTP)' : 'Verify OTP')}
                        </button>
                      </div>
                    </label>
                    <span className="otp-demo-hint">
                      {lang === 'hi' ? 'डेमो ओटीपी कोड: 123456' : 'Demo OTP code: 123456'}
                    </span>
                  </div>
                )}
              </div>

              <label className="input-group">
                <span>{t('onboarding.ageRange')}</span>
                <select
                  className="base-select"
                  value={formData.user.age_range}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      user: { ...p.user, age_range: e.target.value },
                    }))
                  }
                >
                  <option value="18-25">18 - 25 years</option>
                  <option value="26-35">26 - 35 years</option>
                  <option value="36-45">36 - 45 years</option>
                  <option value="46+">46+ years</option>
                </select>
              </label>

              <label className="input-group">
                <span>{t('onboarding.gender')}</span>
                <select
                  className="base-select"
                  value={formData.user.gender || ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      user: { ...p.user, gender: e.target.value },
                    }))
                  }
                >
                  <option value="">{lang === 'hi' ? 'चुनें (वैकल्पिक)' : 'Select (Optional)'}</option>
                  <option value="female">{lang === 'hi' ? 'महिला (Female)' : 'Female'}</option>
                  <option value="male">{lang === 'hi' ? 'पुरुष (Male)' : 'Male'}</option>
                  <option value="other">{lang === 'hi' ? 'अन्य (Other)' : 'Other'}</option>
                </select>
              </label>

              <label className="input-group">
                <span>{t('onboarding.villageTown')} *</span>
                <input
                  type="text"
                  className="base-input"
                  placeholder={t('onboarding.villagePlaceholder')}
                  value={formData.user.village_town}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      user: { ...p.user, village_town: e.target.value },
                    }))
                  }
                  required
                />
              </label>

              <label className="input-group">
                <span>{t('onboarding.district')} *</span>
                <input
                  type="text"
                  className="base-input"
                  placeholder={t('onboarding.districtPlaceholder')}
                  value={formData.user.district}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      user: { ...p.user, district: e.target.value },
                    }))
                  }
                />
              </label>

              <label className="input-group">
                <span>{t('onboarding.nearestCity')}</span>
                <input
                  type="text"
                  className="base-input"
                  placeholder={t('onboarding.nearestCityPlaceholder')}
                  value={formData.user.nearest_city}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      user: { ...p.user, nearest_city: e.target.value },
                    }))
                  }
                />
              </label>

              <label className="input-group">
                <span>{t('onboarding.pincode')}</span>
                <input
                  type="text"
                  maxLength={6}
                  className="base-input"
                  placeholder="411028"
                  value={formData.user.pincode}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      user: { ...p.user, pincode: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
          </section>
        )}

        {/* ================= STEP 3: ACCESSIBILITY & CONSTRAINTS ================= */}
        {step === 3 && (
          <section className="wizard-screen">
            <h2 className="screen-title" tabIndex={-1} ref={stepHeadingRef}>{t('onboarding.accessTitle')}</h2>
            <p className="screen-sub">{t('onboarding.accessSubtitle')}</p>

            <div className="constraints-list">
              {/* WFH Checkbox */}
              <label className="toggle-card">
                <input
                  type="checkbox"
                  checked={formData.accessProfile.wfh_only}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      accessProfile: { ...p.accessProfile, wfh_only: e.target.checked },
                    }))
                  }
                />
                <div className="toggle-text">
                  <strong>
                    <DashIcon name="home" size={16} className="inline-dash-icon" /> {t('onboarding.wfhOnly')}
                  </strong>
                  <span>{lang === 'hi' ? 'सिलाई, डेटा एंट्री या हस्तशिल्प घर से करना' : 'Home-based stitching, data entry or crafts'}</span>
                </div>
              </label>

              {/* Childcare limits */}
              <label className="toggle-card">
                <input
                  type="checkbox"
                  checked={formData.accessProfile.childcare_limits}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      accessProfile: { ...p.accessProfile, childcare_limits: e.target.checked },
                    }))
                  }
                />
                <div className="toggle-text">
                  <strong>
                    <DashIcon name="baby" size={16} className="inline-dash-icon" /> {t('onboarding.childcareLimits')}
                  </strong>
                  <span>{lang === 'hi' ? 'समय में लचीलापन और पास की लोकेशन प्राथमिकता' : 'Flexible hours and nearby opportunities prioritized'}</span>
                </div>
              </label>

              {/* Commute distance slider */}
              {!formData.accessProfile.wfh_only && (
                <div className="slider-card">
                  <div className="slider-header">
                    <span>{t('onboarding.canTravel')}:</span>
                    <strong className="slider-value">
                      {formData.accessProfile.can_travel_km} {t('onboarding.km')}
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    step={2}
                    value={formData.accessProfile.can_travel_km}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        accessProfile: { ...p.accessProfile, can_travel_km: Number(e.target.value) },
                      }))
                    }
                    className="range-input"
                  />
                  <div className="range-labels">
                    <span>2 km (Local)</span>
                    <span>15 km</span>
                    <span>40 km (City/Suburbs)</span>
                  </div>
                </div>
              )}

              {/* Travel mode */}
              {!formData.accessProfile.wfh_only && (
                <div className="input-group">
                  <span>{t('onboarding.travelMode')}</span>
                  <div className="radio-pill-group">
                    {[
                      { id: 'bus', label: t('onboarding.bus') },
                      { id: 'walk', label: t('onboarding.walk') },
                      { id: 'bike', label: t('onboarding.bike') },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        className={`pill-choice ${formData.accessProfile.travel_mode === mode.id ? 'active' : ''}`}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            accessProfile: { ...p.accessProfile, travel_mode: mode.id },
                          }))
                        }
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Available hours */}
              <div className="slider-card">
                <div className="slider-header">
                  <span>{t('onboarding.availableHours')}:</span>
                  <strong className="slider-value">
                    {formData.accessProfile.available_hours} {t('onboarding.hours')}
                  </strong>
                </div>
                <input
                  type="range"
                  min={3}
                  max={10}
                  step={1}
                  value={formData.accessProfile.available_hours}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      accessProfile: { ...p.accessProfile, available_hours: Number(e.target.value) },
                    }))
                  }
                  className="range-input"
                />
              </div>

              {/* Literacy Level */}
              <div className="input-group">
                <span>{t('onboarding.literacyLevel')}</span>
                <select
                  className="base-select"
                  value={formData.accessProfile.literacy_level}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      accessProfile: { ...p.accessProfile, literacy_level: e.target.value },
                    }))
                  }
                >
                  <option value="good">{t('onboarding.canReadWell')}</option>
                  <option value="basic">{t('onboarding.basicLiteracy')}</option>
                  <option value="cannot_read">{t('onboarding.cannotRead')}</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* ================= STEP 4: EDUCATION & CERTIFICATES ================= */}
        {step === 4 && (
          <section className="wizard-screen">
            <h2 className="screen-title" tabIndex={-1} ref={stepHeadingRef}>{t('onboarding.eduTitle')}</h2>
            <p className="screen-sub">{t('onboarding.eduSubtitle')}</p>

            <div className="form-grid-1">
              <label className="input-group">
                <span>{t('onboarding.eduLevel')}</span>
                <select
                  className="base-select"
                  value={formData.accessProfile.education_level || ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      accessProfile: { ...p.accessProfile, education_level: e.target.value },
                    }))
                  }
                >
                  <option value="no_formal">{t('onboarding.noFormal')}</option>
                  <option value="5th_8th">{t('onboarding.primarySchool')}</option>
                  <option value="10th Pass">{t('onboarding.tenthPass')}</option>
                  <option value="12th Pass">{t('onboarding.twelfthPass')}</option>
                  <option value="iti_diploma">{t('onboarding.itiDiploma')}</option>
                  <option value="graduate">{t('onboarding.graduate')}</option>
                </select>
              </label>

              <label className="input-group">
                <span>{t('onboarding.certifications')}</span>
                <textarea
                  className="base-textarea"
                  rows={3}
                  placeholder={
                    lang === 'hi'
                      ? 'उदा. सिलाई डिप्लोमा, ड्राइविंग लाइसेंस, कंप्यूटर कोर्स...'
                      : 'e.g. Tailoring workshop, driving license badge, basic computer...'
                  }
                  value={formData.accessProfile.certifications}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      accessProfile: { ...p.accessProfile, certifications: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
          </section>
        )}

        {/* ================= STEP 5: SKILLS & TRADES ================= */}
        {step === 5 && (
          <section className="wizard-screen">
            <h2 className="screen-title" tabIndex={-1} ref={stepHeadingRef}>{t('onboarding.skillsTitle')}</h2>
            <p className="screen-sub">{t('onboarding.skillsSubtitle')}</p>

            {/* Search filter for skills */}
            <div className="search-skill-wrap">
              <input
                type="text"
                className="base-input search-input"
                placeholder={lang === 'hi' ? 'हुनर खोजें (सिलाई, इलेक्ट्रीशियन, कोडिंग...)' : 'Search skill (tailoring, electrician, coding...)'}
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
            </div>

            {/* Icon Grid */}
            <div className="skills-icon-grid">
              {filteredSkills.map((sk) => {
                const isSelected = formData.selectedSkills.includes(sk.id)
                return (
                  <div
                    key={sk.id}
                    className={`skill-icon-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSkillSelect(sk.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="skill-icon-emoji">
                      <TradeIcon id={sk.id} size={28} />
                    </span>
                    <span className="skill-icon-name">{lang === 'hi' ? sk.hi : sk.en}</span>
                    {isSelected && (
                      <span className="skill-check">
                        <DashIcon name="check" size={12} />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Detail questionnaire for each selected skill */}
            {formData.selectedSkills.map((sId) => {
              const skObj = AVAILABLE_SKILLS.find((s) => s.id === sId)
              const detail = formData.skillDetails[sId] || {}
              return (
                <div key={sId} className="skill-detail-card">
                  <h3 className="detail-card-title">
                    <TradeIcon id={sId} size={22} className="inline-trade-icon" /> {t('onboarding.skillDetailsFor', { skill: lang === 'hi' ? skObj?.hi : skObj?.en })}
                  </h3>

                  <div className="form-grid-2">
                    <label className="input-group">
                      <span>{t('onboarding.yearsExp')}</span>
                      <select
                        className="base-select"
                        value={detail.years_exp || 1}
                        onChange={(e) => updateSkillDetail(sId, 'years_exp', Number(e.target.value))}
                      >
                        <option value={0.5}>{lang === 'hi' ? '6 महीने से कम' : 'Under 6 months'}</option>
                        <option value={1}>{lang === 'hi' ? '1 साल' : '1 year'}</option>
                        <option value={2}>{lang === 'hi' ? '2 साल' : '2 years'}</option>
                        <option value={4}>{lang === 'hi' ? '3 से 5 साल' : '3 to 5 years'}</option>
                        <option value={7}>{lang === 'hi' ? '5+ साल (अनुभवी)' : '5+ years (Experienced)'}</option>
                      </select>
                    </label>

                    <label className="input-group">
                      <span>{t('onboarding.howLearned')}</span>
                      <select
                        className="base-select"
                        value={detail.how_learned || 'self'}
                        onChange={(e) => updateSkillDetail(sId, 'how_learned', e.target.value)}
                      >
                        <option value="family">{t('onboarding.learnedFamily')}</option>
                        <option value="self">{t('onboarding.learnedSelf')}</option>
                        <option value="training">{t('onboarding.learnedTraining')}</option>
                        <option value="job">{t('onboarding.learnedJob')}</option>
                      </select>
                    </label>

                    <label className="input-group full-width">
                      <div className="label-with-mic">
                        <span>{t('onboarding.whatMade')}</span>
                        <button
                          type="button"
                          className={`btn-mic ${isListeningMic ? 'listening' : ''}`}
                          onClick={() => startSpeechRecognition(sId)}
                          title={t('onboarding.speechMic')}
                        >
                          <DashIcon name="mic" size={13} className="inline-dash-icon" /> {isListeningMic ? '...' : t('onboarding.speechMic')}
                        </button>
                      </div>
                      <input
                        type="text"
                        className="base-input"
                        placeholder={t('onboarding.whatMadePlaceholder')}
                        value={detail.what_made || ''}
                        onChange={(e) => updateSkillDetail(sId, 'what_made', e.target.value)}
                      />
                    </label>

                    <label className="input-group">
                      <span>{t('onboarding.workStyle')}</span>
                      <select
                        className="base-select"
                        value={detail.work_style || 'alone'}
                        onChange={(e) => updateSkillDetail(sId, 'work_style', e.target.value)}
                      >
                        <option value="alone">{t('onboarding.alone')}</option>
                        <option value="team">{t('onboarding.team')}</option>
                      </select>
                    </label>

                    <label className="input-group">
                      <span>{t('onboarding.toolsOwned')}</span>
                      <input
                        type="text"
                        className="base-input"
                        placeholder={t('onboarding.toolsPlaceholder')}
                        value={detail.tools_owned || ''}
                        onChange={(e) => updateSkillDetail(sId, 'tools_owned', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* ================= STEP 6: PRACTICAL QUIZ ================= */}
        {step === 6 && (
          <section className="wizard-screen">
            <h2 className="screen-title" tabIndex={-1} ref={stepHeadingRef}>{t('onboarding.quizTitle')}</h2>
            <p className="screen-sub">
              {t('onboarding.quizSubtitle', {
                skill: AVAILABLE_SKILLS.find((s) => s.id === activeQuizSkill)?.[lang === 'hi' ? 'hi' : 'en'] || activeQuizSkill,
              })}
            </p>

            {/* If user has multiple skills, allow switching tabs */}
            {formData.selectedSkills.length > 1 && (
              <div className="quiz-skill-tabs">
                {formData.selectedSkills.map((sId) => {
                  const sk = AVAILABLE_SKILLS.find((s) => s.id === sId)
                  return (
                    <button
                      key={sId}
                      type="button"
                      className={`tab-btn ${activeQuizSkill === sId ? 'active' : ''}`}
                      onClick={() => {
                        setActiveQuizSkill(sId)
                        loadQuiz(sId)
                      }}
                    >
                      <TradeIcon id={sId} size={18} className="inline-trade-icon" /> {lang === 'hi' ? sk?.hi : sk?.en}
                      {formData.quizEvaluations[sId] && (
                        <DashIcon name="check" size={13} className="inline-dash-icon" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {quizLoading ? (
              <div className="loading-card">{t('common.loading')}</div>
            ) : skillQuestions.length === 0 ? (
              <div className="empty-card">
                <p>{lang === 'hi' ? 'इस हुनर के सवाल लोड हो रहे हैं...' : 'Loading placement questions...'}</p>
                <button type="button" className="btn-primary" onClick={() => loadQuiz(activeQuizSkill)}>
                  {t('common.retry')}
                </button>
              </div>
            ) : (
              <div className="quiz-questions-list">
                {skillQuestions.map((q, qIndex) => {
                  const options = lang === 'hi' ? q.options_hi : q.options_en
                  const scenario = lang === 'hi' ? q.scenario_hi : q.scenario_en
                  const questionText = lang === 'hi' ? q.question_hi : q.question_en
                  const selectedIdx = formData.quizAnswers[activeQuizSkill]?.[q.id]

                  return (
                    <div key={q.id} className="quiz-question-card">
                      <div className="q-header">
                        <span className="q-badge">{t('onboarding.questionOf', { current: qIndex + 1, total: skillQuestions.length })}</span>
                        <button
                          type="button"
                          className="btn-icon-listen"
                          onClick={() => speak(`${scenario || ''} ${questionText}`)}
                          title={t('onboarding.listenQuestion')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                          </svg>
                          {t('onboarding.listenQuestion')}
                        </button>
                      </div>

                      {scenario && <p className="q-scenario"><strong>{t('onboarding.scenario')}</strong> {scenario}</p>}
                      <h4 className="q-text">{questionText}</h4>

                      <div className="q-options-grid">
                        {options.map((opt, optIndex) => (
                          <button
                            key={optIndex}
                            type="button"
                            className={`q-option-btn ${selectedIdx === optIndex ? 'selected' : ''}`}
                            onClick={() => handleSelectQuizAnswer(q.id, optIndex)}
                          >
                            <span className="opt-letter">{String.fromCharCode(65 + optIndex)}</span>
                            <span className="opt-text">{opt}</span>
                            {selectedIdx === optIndex && (
                              <span className="opt-check">
                                <DashIcon name="check" size={12} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Submit quiz button or result card */}
                {quizFeedback ? (
                  <div className="quiz-result-banner">
                    <div className="result-badge-row">
                      <span className={`level-pill ${quizFeedback.level.toLowerCase()}`}>
                        {t('onboarding.encouragingLevel')}: {quizFeedback.level}
                      </span>
                    </div>
                    <h4>{t('onboarding.quizResultTitle', { level: quizFeedback.level })}</h4>
                    <p>{lang === 'hi' ? quizFeedback.feedback_hi : quizFeedback.feedback_en}</p>
                    <p className="score-summary">
                      {t('onboarding.quizScore', { score: quizFeedback.score, total: quizFeedback.total })}
                    </p>
                  </div>
                ) : (
                  <button type="button" className="btn-primary btn-large-submit" onClick={submitQuiz}>
                    {t('onboarding.submitQuiz')} →
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= STEP 7: TARGET GOAL ================= */}
        {step === 7 && (
          <section className="wizard-screen">
            <h2 className="screen-title" tabIndex={-1} ref={stepHeadingRef}>{t('onboarding.goalTitle')}</h2>
            <p className="screen-sub">{t('onboarding.goalSubtitle')}</p>

            <div className="goal-selection-grid">
              {[
                { id: 'job', title: t('onboarding.goalTypeJob'), desc: lang === 'hi' ? 'नियमित वेतन व समय' : 'Fixed salary and steady timings' },
                { id: 'apprenticeship', title: t('onboarding.goalTypeApprentice'), desc: lang === 'hi' ? 'सीखते हुए स्टाइपेंड पाना' : 'Earn stipend while getting trained' },
                { id: 'training', title: t('onboarding.goalTypeTraining'), desc: lang === 'hi' ? 'सरकारी आईटीआई व मुफ्त कोर्स' : 'Free government portals & local centers' },
                { id: 'wfh', title: t('onboarding.goalTypeWfh'), desc: lang === 'hi' ? 'सिलाई/डेटा एंट्री घर से करना' : 'Home-based contracts and piece-rate gigs' },
                { id: 'business', title: t('onboarding.goalTypeBusiness'), desc: lang === 'hi' ? 'अपनी दुकान व मुद्रा लोन सहायता' : 'Own micro-enterprise with loan support' },
              ].map((g) => (
                <div
                  key={g.id}
                  className={`goal-card ${formData.goal.goal_type === g.id ? 'selected' : ''}`}
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      goal: { ...p.goal, goal_type: g.id },
                    }))
                  }
                  role="button"
                  tabIndex={0}
                >
                  <span className="goal-icon">
                    <GoalIcon id={g.id} size={28} />
                  </span>
                  <div className="goal-text">
                    <h4>{g.title}</h4>
                    <p>{g.desc}</p>
                  </div>
                  {formData.goal.goal_type === g.id && (
                    <span className="check-badge">
                      <DashIcon name="check" size={14} />
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="target-role-select-box">
              <label className="input-group">
                <span>{t('onboarding.targetRole')}</span>
                <select
                  className="base-select"
                  value={formData.goal.target_role}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      goal: { ...p.goal, target_role: e.target.value },
                    }))
                  }
                >
                  {AVAILABLE_SKILLS.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {lang === 'hi' ? sk.hi : sk.en}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <footer className="wizard-bottom-bar">
        {stepError && (
          <div className="bottom-bar-error-hint" role="alert">
            <DashIcon name="alert" size={15} />
            <span>{stepError}</span>
          </div>
        )}
        <div className="wizard-bottom-bar-inner">
          {step > 1 ? (
            <button type="button" className="btn-secondary" onClick={handleBack}>
              ← {t('onboarding.back')}
            </button>
          ) : (
            <div />
          )}

          <button type="button" className="btn-primary" onClick={handleNext}>
            {step === 7 ? t('onboarding.save') : t('onboarding.next')} →
          </button>
        </div>
      </footer>
    </main>
  )
}
