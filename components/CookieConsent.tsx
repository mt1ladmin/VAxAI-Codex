'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

export type CookiePreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
  decided: boolean
}

const STORAGE_KEY = 'vaxai-cookie-consent'
export const COOKIE_CONSENT_EVENT = 'vaxai:cookie-consent-decided'

function loadPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CookiePreferences
  } catch {
    /* storage unavailable */
  }
  return null
}

function savePreferences(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* storage unavailable */
  }
}

function dispatch(prefs: CookiePreferences) {
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: prefs }))
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const existing = loadPreferences()
    if (!existing || !existing.decided) {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
    dispatch(existing)
  }, [])

  function acceptAll() {
    const prefs: CookiePreferences = { necessary: true, analytics: true, marketing: true, decided: true }
    savePreferences(prefs)
    dispatch(prefs)
    setVisible(false)
  }

  function rejectNonEssential() {
    const prefs: CookiePreferences = { necessary: true, analytics: false, marketing: false, decided: true }
    savePreferences(prefs)
    dispatch(prefs)
    setVisible(false)
  }

  function saveManaged() {
    const prefs: CookiePreferences = { necessary: true, analytics, marketing, decided: true }
    savePreferences(prefs)
    dispatch(prefs)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookie consent"
      className="cookie-banner__backdrop fixed inset-0 z-[8900] flex items-center justify-center bg-ink/55 px-4 backdrop-blur-sm"
    >
      <div className="cookie-banner__panel w-full max-w-[540px] rounded-2xl border border-[#122428]/12 bg-white p-6 shadow-[0_16px_56px_rgba(18,36,40,0.18)] sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122428]">
          Cookie preferences
        </p>
        <p className="mt-2 text-[14px] leading-[1.65] text-[#111111]">
          We use cookies and similar technologies to make our website work and to understand how
          you use it. Some are strictly necessary; others help us improve your experience. Please
          choose what you are comfortable with before continuing.{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[#122428]">
            Privacy&nbsp;policy
          </Link>
          .
        </p>

        <div className="mt-5 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowManage((v) => !v)}
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-500 transition-colors hover:text-[#111111]"
            aria-expanded={showManage}
          >
            Manage preferences
            {showManage ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showManage && (
            <div className="mt-4 space-y-3">
              <CategoryRow
                label="Strictly necessary"
                description="Required for the website to function — sessions, security and accessibility settings. Cannot be disabled."
                checked={true}
                disabled
                onChange={() => {}}
              />
              <CategoryRow
                label="Analytics"
                description="Help us understand how visitors use the site so we can improve it. No personal data is sold."
                checked={analytics}
                onChange={setAnalytics}
              />
              <CategoryRow
                label="Marketing and communications"
                description="Used to tailor newsletter communications and measure their effectiveness."
                checked={marketing}
                onChange={setMarketing}
              />
              <button
                type="button"
                onClick={saveManaged}
                className="cookie-banner__btn-secondary mt-2 rounded-md border border-gray-300 px-4 py-2 text-[12.5px] font-semibold text-[#111111] transition-colors hover:border-[#122428] hover:text-[#122428]"
              >
                Save my preferences
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2.5 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={rejectNonEssential}
            className="cookie-banner__btn-secondary flex-1 rounded-md border border-gray-300 px-5 py-2.5 text-[13px] font-semibold text-[#111111] transition-colors hover:border-[#122428] sm:flex-none"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="cookie-banner__btn-primary flex-1 rounded-md bg-[#122428] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 sm:flex-none"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryRow({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#111111]">{label}</p>
        <p className="mt-0.5 text-[11.5px] leading-[1.5] text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122428] disabled:cursor-not-allowed ${
          checked
            ? 'border-[#122428] bg-[#122428]'
            : 'border-gray-300 bg-gray-100'
        }`}
        aria-label={`${label}: ${checked ? 'on' : 'off'}`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[17px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
