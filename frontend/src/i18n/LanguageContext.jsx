import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import en from './en.json'
import hi from './hi.json'

const DICTIONARIES = { en, hi }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('skillsetu-lang') || 'hi'
    } catch {
      return 'hi'
    }
  })

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const activeUtteranceRef = useRef(null)
  const activeAudioRef = useRef(null)
  const resumeTimerRef = useRef(null)

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Load and cache browser voices as soon as available
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices() || []
        if (available.length > 0) {
          setVoices(available)
        }
      } catch (_) {}
    }

    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const setLanguage = (newLang) => {
    const valid = newLang === 'en' ? 'en' : 'hi'
    setLangState(valid)
    try {
      localStorage.setItem('skillsetu-lang', valid)
    } catch (_) {}

    // Also update backend profile if user token exists
    try {
      const token = localStorage.getItem('skillsetu-token')
      if (token) {
        fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: valid }),
        }).catch(() => {})
      }
    } catch (_) {}
  }

  // Translation helper with dotted keys and parameters: t('onboarding.stepOf', { current: 1, total: 7 })
  const t = (keyPath, params = {}) => {
    const dict = DICTIONARIES[lang] || DICTIONARIES.hi
    const fallbackDict = DICTIONARIES.en

    const keys = keyPath.split('.')
    let current = dict
    let fallbackCurrent = fallbackDict

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        current = undefined
      }

      if (fallbackCurrent && typeof fallbackCurrent === 'object' && k in fallbackCurrent) {
        fallbackCurrent = fallbackCurrent[k]
      } else {
        fallbackCurrent = undefined
      }
    }

    let result = typeof current === 'string' ? current : (typeof fallbackCurrent === 'string' ? fallbackCurrent : keyPath)

    // Substitute {param}
    if (params && typeof params === 'object') {
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
      }
    }

    return result
  }

  // Helper to find best Hindi voice across macOS, Chrome, Windows, Android, iOS
  const findBestVoice = (targetLang) => {
    const available = (voices.length ? voices : window.speechSynthesis.getVoices()) || []
    if (!available.length) return null

    if (targetLang === 'hi') {
      // 1. Exact Hindi locale matches (hi-IN, hi_IN)
      let match = available.find(
        (v) => v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.toLowerCase() === 'hi-in'
      )
      if (match) return match

      // 2. Starts with 'hi'
      match = available.find((v) => v.lang.toLowerCase().startsWith('hi'))
      if (match) return match

      // 3. Name contains Hindi keywords (Lekha on Mac, Google हिन्दी in Chrome, Swara in Edge/Windows)
      match = available.find((v) => {
        const n = v.name.toLowerCase()
        return (
          n.includes('hindi') ||
          n.includes('हिन्दी') ||
          n.includes('lekha') ||
          n.includes('swara') ||
          n.includes('kalpana') ||
          n.includes('hemant') ||
          n.includes('neerja')
        )
      })
      if (match) return match

      // 4. Any Indian voice fallback
      match = available.find((v) => v.lang.includes('IN') || v.lang.includes('in'))
      if (match) return match

      return null
    } else {
      // English
      return (
        available.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN') ||
        available.find((v) => v.lang.startsWith('en')) ||
        null
      )
    }
  }

  // Play audio stream via backend /api/tts proxy with natural Hindi Google TTS
  const playAudioStream = (text, targetLang, onFallback) => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current = null
      }

      const clean = (text || '').trim()
      if (!clean) {
        setIsSpeaking(false)
        return
      }

      const ttsUrl = `/api/tts?lang=${targetLang === 'hi' ? 'hi' : 'en'}&text=${encodeURIComponent(clean)}`
      const audio = new Audio(ttsUrl)
      activeAudioRef.current = audio

      audio.onplay = () => {
        setIsSpeaking(true)
      }

      audio.onended = () => {
        setIsSpeaking(false)
        activeAudioRef.current = null
      }

      audio.onerror = (e) => {
        console.warn('[Audio Stream Error] Falling back to Web Speech API:', e)
        activeAudioRef.current = null
        if (typeof onFallback === 'function') {
          onFallback()
        } else {
          setIsSpeaking(false)
        }
      }

      setIsSpeaking(true)
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Audio play blocked/failed]:', err)
          if (typeof onFallback === 'function') {
            onFallback()
          } else {
            setIsSpeaking(false)
          }
        })
      }
    } catch (err) {
      console.error('[TTS Execution Error]:', err)
      if (typeof onFallback === 'function') {
        onFallback()
      } else {
        setIsSpeaking(false)
      }
    }
  }

  // Fallback to browser SpeechSynthesis
  const speakWithSynthesis = (textToSpeak, targetLang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false)
      return
    }

    try {
      window.speechSynthesis.cancel()

      const bestVoice = findBestVoice(targetLang)
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      activeUtteranceRef.current = utterance

      if (bestVoice) {
        utterance.voice = bestVoice
        utterance.lang = bestVoice.lang
      } else {
        utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-IN'
      }

      utterance.rate = targetLang === 'hi' ? 0.9 : 0.96
      utterance.pitch = 1.0

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        activeUtteranceRef.current = null
        if (resumeTimerRef.current) {
          clearInterval(resumeTimerRef.current)
          resumeTimerRef.current = null
        }
      }

      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis Error]:', e)
        setIsSpeaking(false)
        activeUtteranceRef.current = null
      }

      if (resumeTimerRef.current) clearInterval(resumeTimerRef.current)
      resumeTimerRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
      }, 10000)

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('[SpeechSynthesis Exception]:', err)
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    // 1. Cancel speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch (_) {}
    }

    // 2. Pause audio stream
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause()
        activeAudioRef.current.currentTime = 0
      } catch (_) {}
      activeAudioRef.current = null
    }

    // 3. Clear timers
    if (resumeTimerRef.current) {
      clearInterval(resumeTimerRef.current)
      resumeTimerRef.current = null
    }

    activeUtteranceRef.current = null
    setIsSpeaking(false)
  }

  const speak = (textToSpeak, forcedLang) => {
    if (!textToSpeak || typeof textToSpeak !== 'string') return

    // Stop any ongoing speech or audio immediately
    stopSpeaking()

    const targetLang = forcedLang || lang

    // For Hindi: use dedicated audio stream endpoint for 100% natural, clear pronunciation
    if (targetLang === 'hi') {
      playAudioStream(textToSpeak, 'hi', () => {
        speakWithSynthesis(textToSpeak, 'hi')
      })
      return
    }

    // For English: use native voice if available, else audio stream
    const bestVoice = findBestVoice('en')
    if (bestVoice) {
      speakWithSynthesis(textToSpeak, 'en')
    } else {
      playAudioStream(textToSpeak, 'en', () => {
        speakWithSynthesis(textToSpeak, 'en')
      })
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        t,
        speak,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}

