import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiSendOtp, apiVerifyOtp } from '../api.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { DashIcon } from './DashboardIcons.jsx'

export default function Login() {
  const { t, lang, speak, isSpeaking, stopSpeaking } = useLanguage()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError('')
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setError(t('auth.errorPhone'))
      return
    }

    setLoading(true)
    try {
      await apiSendOtp(cleanPhone)
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e?.preventDefault()
    setError('')
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (!otp.trim()) {
      setError(t('auth.errorOtp'))
      return
    }

    setLoading(true)
    try {
      const res = await apiVerifyOtp(cleanPhone, otp.trim(), lang)
      if (res.token) {
        localStorage.setItem('skillsetu-token', res.token)
        localStorage.setItem('skillsetu-user', JSON.stringify(res.user))
        navigate('/opportunities')
      }
    } catch (err) {
      setError(err.message || t('auth.errorOtp'))
    } finally {
      setLoading(false)
    }
  }

  const fillDemoOtp = () => {
    setOtp('123456')
  }

  const listenInstructions = () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }
    if (step === 'phone') {
      speak(
        lang === 'hi'
          ? 'कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें और ओटीपी भेजें बटन दबाएं।'
          : 'Please enter your 10 digit mobile number and press send OTP.'
      )
    } else {
      speak(
        lang === 'hi'
          ? 'आपके फोन पर भेजा गया 6 अंकों का ओटीपी कोड दर्ज करें। डेमो के लिए कोड 1 2 3 4 5 6 का उपयोग करें।'
          : 'Enter the 6-digit OTP code sent to your phone. For demo, use 123456.'
      )
    }
  }

  return (
    <main id="main" className="login-page-wrap">
      <div className="login-card-container">
        <div className="login-brand-header">
          <Link to="/" className="login-logo-link">
            <span className="login-brand-name">SkillSetu</span>
            <span className="login-brand-hi">स्किलसेतु</span>
          </Link>
          <span className="login-badge-tag">
            {lang === 'hi' ? 'फोन लॉगिन' : 'Phone Login'}
          </span>
        </div>

        <div className="auth-card-body">
          <div className="auth-header-row">
            <div>
              <h1 className="auth-page-title">{t('auth.title')}</h1>
              <p className="auth-page-subtitle">{t('auth.subtitle')}</p>
            </div>
            <button
              type="button"
              className={`btn-icon-listen ${isSpeaking ? 'active' : ''}`}
              onClick={listenInstructions}
              title={isSpeaking ? t('nav.stopListening') : t('nav.listen')}
              aria-label={t('nav.listen')}
            >
              {isSpeaking ? <DashIcon name="stop" size={16} /> : <DashIcon name="speaker" size={16} />}
              <span className="listen-btn-text">
                {isSpeaking ? t('nav.stopListening') : t('nav.listen')}
              </span>
            </button>
          </div>

          {error && <div className="auth-error-box">{error}</div>}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="auth-form-card">
              <label className="auth-input-label">
                <span>{t('auth.phoneLabel')}</span>
                <div className="phone-field-wrap">
                  <span className="phone-country-code">+91</span>
                  <input
                    type="tel"
                    className="auth-input-styled"
                    placeholder={t('auth.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </label>

              <button type="submit" className="action-btn-primary auth-submit-large" disabled={loading}>
                {loading ? t('common.loading') : t('auth.sendOtp')} →
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form-card">
              <div className="phone-verified-pill">
                <span>+91 {phone}</span>
                <button
                  type="button"
                  className="btn-change-number"
                  onClick={() => setStep('phone')}
                >
                  {t('auth.changePhone')}
                </button>
              </div>

              <label className="auth-input-label">
                <span>{t('auth.enterOtp')}</span>
                <input
                  type="text"
                  maxLength={6}
                  className="auth-input-styled otp-box-styled"
                  placeholder={t('auth.otpPlaceholder')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                  required
                />
              </label>

              <div className="otp-demo-hint-box">
                <span className="otp-hint-text">
                  <DashIcon name="bulb" size={14} /> {t('auth.otpHint')}
                </span>
                <button type="button" className="btn-auto-otp" onClick={fillDemoOtp}>
                  {t('auth.autoFillDemo')}
                </button>
              </div>

              <button type="submit" className="action-btn-primary auth-submit-large" disabled={loading}>
                {loading ? t('common.loading') : t('auth.verifyOtp')} <DashIcon name="check" size={16} />
              </button>
            </form>
          )}

          <div className="login-footer-links">
            <Link to="/" className="back-home-link">
              ← {lang === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/onboarding" className="onboarding-direct-link">
              {lang === 'hi' ? 'नया खाता बनाएं' : 'Create New Profile'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
