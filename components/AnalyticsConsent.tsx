'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { COOKIE_CONSENT_EVENT } from '@/components/CookieConsent'

const STORAGE_KEY = 'vaxai-cookie-consent'

export default function AnalyticsConsent() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    function checkConsent() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const prefs = JSON.parse(raw)
          if (prefs?.analytics === true) setEnabled(true)
        }
      } catch {
        /* storage unavailable */
      }
    }

    checkConsent()

    function onConsentDecided(e: Event) {
      const prefs = (e as CustomEvent<{ analytics: boolean }>)?.detail
      if (prefs?.analytics === true) setEnabled(true)
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentDecided)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentDecided)
  }, [])

  if (!enabled) return null
  return <Analytics />
}