import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Home from './components/Home.jsx'
import Legal from './components/Legal.jsx'
import MorphNav from './components/MorphNav.jsx'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext.jsx'
import { PRIVACY, TERMS } from './legal.js'
import { RM, scroller, scrollToTarget, initScrollReveal } from './lib.js'

gsap.registerPlugin(ScrollTrigger)

const Onboarding = lazy(() => import('./components/Onboarding.jsx'))
const Dashboard = lazy(() => import('./components/Dashboard.jsx'))
const Login = lazy(() => import('./components/Login.jsx'))
const Overview = lazy(() => import('./components/Overview.jsx'))

function AppContent() {
  const { pathname } = useLocation()
  const { lang, t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  // Smooth scroll (Lenis) wired into GSAP's ticker with enhanced smooth dampening
  useEffect(() => {
    if (RM) return
    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    })
    scroller.lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      scroller.lenis = null
    }
  }, [])

  // New page or lang change: go to top, refresh ScrollTrigger, and initialize scroll reveal
  useEffect(() => {
    if (scroller.lenis) scroller.lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
    setHidden(false)
    ScrollTrigger.refresh()
    const timer = setTimeout(() => {
      initScrollReveal()
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname, lang])

  // Header scroll appearance
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      if (y > 480 && y > last + 6) setHidden(true)
      else if (y < last - 6 || y < 480) setHidden(false)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // In-page anchor smooth scroll
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a || a.getAttribute('href') === '#') return
      const el = document.querySelector(a.getAttribute('href'))
      if (!el) return
      e.preventDefault()
      scrollToTarget(el)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <>
      <a className="skip" href="#main">
        {lang === 'hi' ? 'सीधे सामग्री पर जाएं' : 'Skip to content'}
      </a>
      <div id="pb" aria-hidden="true" />
      <MorphNav scrolled={scrolled} hidden={hidden} />

      <div key={pathname}>
        <Suspense fallback={<main id="main" style={{ minHeight: '70vh', padding: '4rem 1rem' }}>{t('common.loading')}</main>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/opportunities" element={<Dashboard />} />
            <Route path="/learn" element={<Dashboard />} />
            <Route path="/career" element={<Dashboard />} />
            <Route path="/verification" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<Legal doc={PRIVACY} />} />
            <Route path="/terms" element={<Legal doc={TERMS} />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>

      <footer className="site-footer">
        <div className="w footer-inner-row">
          <div className="footer-left-info">
            <span className="footer-brand">SkillSetu (स्किलसेतु)</span>
            <p className="footer-sub">
              {lang === 'hi'
                ? 'हुनर से मंज़िल तक - ग्रामीण व निम्न-आय समुदायों के लिए रोजगार व कौशल मंच।'
                : 'Bridge from Skills to Livelihoods - empowering rural and low-income communities.'}
            </p>
          </div>
          <div className="footer-links-row">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="footer-dot">•</span>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
