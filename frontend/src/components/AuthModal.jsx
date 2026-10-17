import React, { useState } from 'react'
import { apiSendOtp, apiVerifyOtp } from '../api.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const { t, lang, speak } = useLanguage()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

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
        if (onLoginSuccess) onLoginSuccess(res.user)
        onClose()
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
    <div className="auth-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <div className="auth-title-row">
            <h3>{t('auth.title')}</h3>
            <button
              type="button"
              className="btn-icon-listen"
              onClick={listenInstructions}
              title={t('nav.listen')}
              aria-label={t('nav.listen')}
            >
              <DashIcon name="speaker" size={16} />
            </button>
          </div>
          <p className="auth-sub">{t('auth.subtitle')}</p>
          <button className="auth-close" onClick={onClose} aria-label={t('common.close')}>
            <DashIcon name="close" size={16} />
          </button>
        </div>

        {error && <div className="auth-error-box">{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <label className="auth-label">
              <span>{t('auth.phoneLabel')}</span>
              <div className="phone-input-wrap">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  className="auth-input"
                  placeholder={t('auth.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </label>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? t('common.loading') : t('auth.sendOtp')} →
            </button>

            <button
              type="button"
              className="btn-ghost"
              style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.85rem' }}
              onClick={() => {
                setPhone('9876543210')
                setTimeout(() => setStep('otp'), 200)
              }}
            >
              <DashIcon name="lightning" size={14} /> Quick Fill Demo Phone (9876543210)
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="phone-confirm-badge">
              <span>+91 {phone}</span>
              <button type="button" className="btn-link" onClick={() => setStep('phone')}>
                {t('auth.changePhone')}
              </button>
            </div>

            <label className="auth-label">
              <span>{t('auth.enterOtp')}</span>
              <input
                type="text"
                maxLength={6}
                className="auth-input otp-input"
                placeholder={t('auth.otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                required
              />
            </label>

            <div className="otp-demo-card">
              <span className="otp-hint-text">
                <DashIcon name="bulb" size={14} /> {t('auth.otpHint')}
              </span>
              <button type="button" className="btn-small-demo" onClick={fillDemoOtp}>
                {t('auth.autoFillDemo')}
              </button>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? t('common.loading') : t('auth.verifyOtp')} <DashIcon name="check" size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
