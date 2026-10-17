import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { DashIcon } from './DashboardIcons.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import '../morphnav.css'

function SetuMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true" width="28" height="28">
      <defs>
        <linearGradient id="setuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8803f" />
          <stop offset="100%" stopColor="#b54610" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#setuGrad)" />
      {/* Bridge / Setu arc */}
      <path
        d="M6 21 C 12 11, 20 11, 26 21"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Bridge pillars */}
      <line x1="11" y1="17" x2="11" y2="23" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="14" x2="16" y2="23" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="21" y1="17" x2="21" y2="23" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export default function MorphNav({ scrolled = false, hidden = false }) {
  const { lang, setLanguage, t, speak, stopSpeaking, isSpeaking } = useLanguage()
  const location = useLocation()
  const currentPath = location.pathname

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillsetu-user')
      if (stored) return JSON.parse(stored)
      const token = localStorage.getItem('skillsetu-token')
      const completed = localStorage.getItem('skillsetu-completed')
      if (completed || token) {
        const ob = localStorage.getItem('skillsetu-onboarding')
        if (ob) return JSON.parse(ob).user || { name: 'Candidate' }
        return { name: 'Candidate' }
      }
      return null
    } catch {
      return null
    }
  })

  // Listen for storage and custom auth-change events
  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem('skillsetu-user')
        if (stored) {
          setCurrentUser(JSON.parse(stored))
          return
        }
        const token = localStorage.getItem('skillsetu-token')
        const completed = localStorage.getItem('skillsetu-completed')
        if (completed || token) {
          const ob = localStorage.getItem('skillsetu-onboarding')
          if (ob && JSON.parse(ob).user) {
            setCurrentUser(JSON.parse(ob).user)
            return
          }
          setCurrentUser({ name: 'Candidate' })
          return
        }
        setCurrentUser(null)
      } catch (_) {
        setCurrentUser(null)
      }
    }
    checkUser()
    window.addEventListener('storage', checkUser)
    window.addEventListener('auth-change', checkUser)
    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('auth-change', checkUser)
    }
  }, [location.pathname])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('skillsetu-token')
    localStorage.removeItem('skillsetu-user')
    localStorage.removeItem('skillsetu-completed')
    setCurrentUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  const handleSpeakNav = () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }

    const path = location.pathname
    const search = new URLSearchParams(location.search)
    const tab = search.get('tab')

    let explanation = ''

    if (path === '/opportunities' || (path === '/dashboard' && tab === 'opportunities')) {
      explanation =
        lang === 'hi'
          ? 'रोजगार व अवसर: यह स्क्रीन आपकी यात्रा सीमा, वाहन और घर से काम की सुविधा के अनुसार जाँचे गए स्थानीय रोजगार और अप्रेंटिसशिप दिखाती है। आप सीधे व्हाट्सएप पर नियोक्ता से संपर्क कर सकते हैं।'
          : 'Job Opportunities: Verified jobs and apprenticeships matched strictly to your trade, commute distance, and work-from-home preferences with direct WhatsApp employer contact.'
    } else if (path === '/learn' || (path === '/dashboard' && tab === 'learn')) {
      explanation =
        lang === 'hi'
          ? 'कोर्स लर्निंग: यहाँ सरकारी आईटीआई, पीएमकेवीवाई और यूट्यूब के 100% निःशुल्क और प्रमाणित कोर्स आपके हुनर के अनुसार दिखाए गए हैं ताकि आप नई तकनीक सीखकर अपनी कमाई बढ़ा सकें।'
          : 'Course Learning: Zero-cost and government certified courses from ITI, PMKVY, and skill academies sorted free-first to help you master new trade techniques and boost your income.'
    } else if (path === '/career' || (path === '/dashboard' && tab === 'career')) {
      explanation =
        lang === 'hi'
          ? 'करियर मार्ग: यह 5-चरणीय रोडमैप है जो बुनियादी हुनर से लेकर मास्टर कारीगर या अपनी दुकान शुरू करने तक का रास्ता दिखाता है, जिसमें हर चरण का समय, आय लक्ष्य और साप्ताहिक कार्य शामिल हैं।'
          : 'Career Roadmap: An interactive 5-stage career progression pathway with milestone targets, estimated monthly income, and weekly actionable steps from foundation to enterprise.'
    } else if (path === '/profile' || (path === '/dashboard' && tab === 'profile')) {
      explanation =
        lang === 'hi'
          ? 'प्रोफ़ाइल और प्राथमिकताएं: यहाँ आप अपना नाम, गांव या कस्बा, अधिकतम यात्रा दूरी और घर से काम करने की प्राथमिकता को आसानी से देख और बदल सकते हैं।'
          : 'Profile & Preferences: Review and update your personal details, village or town, maximum travel limits, and work-from-home preferences.'
    } else if (path === '/dashboard') {
      explanation =
        lang === 'hi'
          ? 'डैशबोर्ड अवलोकन: यहाँ आपकी प्रोफ़ाइल, सत्यापित हुनर, स्थान, यात्रा सीमा और आपके कार्यक्षेत्र से जुड़े पूरक कौशल दिखाए गए हैं।'
          : 'Dashboard Overview: Here you can view your profile summary, verified skills, commute preferences, and recommended complementary skills in your trade domain.'
    } else if (path === '/overview') {
      explanation =
        lang === 'hi'
          ? 'मार्गदर्शिका: यहाँ नए उपयोगकर्ताओं के लिए 6 आसान चरणों में मंच का उपयोग करने का पूरा तरीका और वास्तविक स्क्रीनशॉट दिए गए हैं।'
          : 'Overview Guide: Step-by-step methodology guide with reference screenshots explaining how to use SkillSetu from assessment to direct hiring.'
    } else if (path === '/onboarding') {
      explanation =
        lang === 'hi'
          ? 'कौशल मूल्यांकन: अपना हुनर चुनें, स्थान और यात्रा सीमा बताएं, और बिना किसी रिजेक्शन के 5 आसान सवालों के जवाब दें।'
          : 'Skill Assessment: Select your trade, specify your commute preferences, and answer 5 scenario questions with zero rejection.'
    } else {
      explanation =
        lang === 'hi'
          ? 'स्किलसेतु मुख्य पृष्ठ: ग्रामीण और निम्न-आय कारीगरों के लिए हुनर, स्थान और यात्रा सीमा के आधार पर रोजगार, अप्रेंटिसशिप और कोर्स लर्निंग का मंच।'
          : 'SkillSetu Home: Connecting individuals from rural and low-income communities with jobs, apprenticeships, and course learning considering their location, travel mode, and real skills.'
    }

    speak(explanation)
  }

  return (
    <>
      <header className={`morph-header ${scrolled ? 'is-scrolled' : ''} ${hidden ? 'is-hidden' : ''}`}>
        <div className="w morph-header-inner">
          {/* Logo & Brand */}
          <Link to="/" className="morph-brand-link" aria-label="SkillSetu Home">
            <SetuMark />
            <div className="morph-brand-text">
              <span className="morph-brand-name">SkillSetu</span>
              <span className="morph-brand-hi">स्किलसेतु</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="morph-desktop-links" aria-label="Main Navigation">
            <Link to="/" className={`morph-nav-item ${currentPath === '/' ? 'active' : ''}`}>
              {t('nav.home')}
            </Link>
            <Link
              to="/overview"
              className={`morph-nav-item ${currentPath.startsWith('/overview') ? 'active' : ''}`}
            >
              {t('nav.overview')}
            </Link>
            <Link
              to="/opportunities"
              className={`morph-nav-item ${currentPath.startsWith('/opportunities') ? 'active' : ''}`}
            >
              {t('nav.opportunities')}
            </Link>
            <Link
              to="/learn"
              className={`morph-nav-item ${currentPath.startsWith('/learn') ? 'active' : ''}`}
            >
              {t('nav.learn')}
            </Link>
            <Link
              to="/career"
              className={`morph-nav-item ${currentPath.startsWith('/career') ? 'active' : ''}`}
            >
              {t('nav.career')}
            </Link>
            <Link
              to="/verification"
              className={`morph-nav-item ${currentPath.startsWith('/verification') ? 'active' : ''}`}
            >
              {lang === 'hi' ? 'हुनर सत्यापन' : 'Verify Skill'}
            </Link>
            <Link
              to="/dashboard"
              className={`morph-nav-item ${currentPath.startsWith('/dashboard') || currentPath.startsWith('/profile') ? 'active' : ''}`}
            >
              {t('nav.dashboard')}
            </Link>
          </nav>

          {/* Actions: Listen button, Language Switcher, Onboard/Profile, Theme */}
          <div className="morph-right-actions">
            {/* Listen button for accessibility */}
            <button
              type="button"
              className={`btn-listen-nav ${isSpeaking ? 'speaking' : ''}`}
              onClick={handleSpeakNav}
              title={isSpeaking ? t('nav.stopListening') : t('nav.listen')}
              aria-label={t('nav.listen')}
            >
              {isSpeaking ? (
                <DashIcon name="stop" size={15} />
              ) : (
                <DashIcon name="speaker" size={15} />
              )}
              <span className="btn-listen-text">{isSpeaking ? t('nav.stopListening') : t('nav.listen')}</span>
            </button>

            {/* Language Switcher */}
            <div className="lang-switcher-pill" role="group" aria-label="Language selection">
              <button
                type="button"
                className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
                onClick={() => setLanguage('hi')}
                aria-pressed={lang === 'hi'}
              >
                हिन्दी
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>

            {/* If completed, show user profile link. Otherwise show single Start Now action */}
            {currentUser ? (
              <div className="user-profile-badge">
                <Link to="/dashboard" className="user-avatar-btn" title={currentUser.name || 'User'}>
                  <DashIcon name="user" size={14} className="inline-dash-icon" />
                  <span>{currentUser.name || (currentUser.phone ? `...${currentUser.phone.slice(-4)}` : 'Dashboard')}</span>
                </Link>
                <button
                  type="button"
                  className="btn-link logout-link"
                  onClick={handleLogout}
                  title={t('nav.logout')}
                >
                  <DashIcon name="close" size={13} />
                </button>
              </div>
            ) : (
              <Link to="/onboarding" className="btn-primary btn-sm nav-start-btn">
                {lang === 'hi' ? 'शुरू करें' : 'Start Now'} →
              </Link>
            )}

            <ThemeToggle />

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <DashIcon name="close" size={20} />
              ) : (
                <DashIcon name="menu" size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.home')}
              </Link>
              <Link to="/overview" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.overview')}
              </Link>
              <Link to="/opportunities" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.opportunities')}
              </Link>
              <Link to="/learn" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.learn')}
              </Link>
              <Link to="/career" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.career')}
              </Link>
              <Link to="/verification" onClick={() => setMobileMenuOpen(false)}>
                {lang === 'hi' ? 'हुनर सत्यापन' : 'Verify Skill'}
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.dashboard')}
              </Link>

              {currentUser ? (
                <div className="mobile-user-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <Link to="/dashboard" className="mobile-cta-link" onClick={() => setMobileMenuOpen(false)}>
                    {lang === 'hi' ? 'डैशबोर्ड खोलें →' : 'Go to Dashboard →'}
                  </Link>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '10px', fontSize: '0.9rem' }}
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link to="/onboarding" className="mobile-cta-link" onClick={() => setMobileMenuOpen(false)}>
                  {lang === 'hi' ? 'शुरू करें (Start Now) →' : 'Start Now →'}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
