'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { COOKIE_CONSENT_EVENT } from '@/components/CookieConsent'

const STORAGE_KEY = 'vaxai-newsletter-popup'
const COOKIE_STORAGE_KEY = 'vaxai-cookie-consent'
const DELAY_MS = 60_000

type PopupState = 'dismissed' | 'subscribed'
type SubmitStatus = 'idle' | 'loading' | 'done' | 'error'

function loadState(): PopupState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'dismissed' || raw === 'subscribed') return raw
  } catch {
    /* storage unavailable */
  }
  return null
}

function saveState(state: PopupState) {
  try {
    localStorage.setItem(STORAGE_KEY, state)
  } catch {
    /* storage unavailable */
  }
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function schedulePopup() {
    if (loadState()) return
    if (timerRef.current) return
    timerRef.current = setTimeout(() => {
      if (!loadState()) setVisible(true)
    }, DELAY_MS)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COOKIE_STORAGE_KEY)
      if (raw) {
        const prefs = JSON.parse(raw)
        if (prefs?.decided) schedulePopup()
      }
    } catch {
      /* storage unavailable */
    }

    function onConsentDecided() {
      schedulePopup()
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentDecided)
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentDecided)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function dismiss() {
    if (status !== 'done') saveState('dismissed')
    setVisible(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setStatus('done')
      saveState('subscribed')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (!visible) return null

  return (
    <div
      className="newsletter-popup__backdrop fixed inset-0 z-[8800] flex items-end justify-center bg-[#063b32]/40 px-4 pb-6 backdrop-blur-[2px] sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter sign-up"
    >
      <div className="newsletter-popup__panel relative w-full max-w-[460px] rounded-2xl bg-[#063b32] px-6 py-7 text-white shadow-[0_24px_64px_rgba(6,59,50,0.45)] sm:px-8 sm:py-9">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close newsletter sign-up"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f5f274]">
          VAxAI · Newsletter
        </p>

        {status === 'done' ? (
          <div className="mt-5 flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f274]">
              <Check className="h-6 w-6 text-[#063b32]" />
            </span>
            <p className="text-[1.15rem] font-semibold leading-snug text-white">
              You&rsquo;re subscribed
            </p>
            <p className="max-w-[28ch] text-[13.5px] leading-[1.65] text-white/65">
              Thank you. You&rsquo;ll receive the latest VAxAI insights directly to your inbox.
            </p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="newsletter-popup__btn mt-2 rounded-md bg-[#f5f274] px-5 py-2.5 text-[13px] font-semibold text-[#063b32] transition-opacity hover:opacity-90"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="mt-3 text-[1.45rem] font-semibold leading-[1.2] text-white sm:text-[1.6rem]">
              Practical admin support, in your inbox
            </h2>

            <p className="mt-3 text-[13.5px] leading-[1.7] text-white/70">
              Get VAxAI thinking on admin support, AI-assisted workflows and the VAT Framework,
              delivered directly to your inbox.
            </p>

            <form onSubmit={onSubmit} className="mt-6">
              <label
                htmlFor="popup-newsletter-email"
                className="block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45"
              >
                Your email address
              </label>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  id="popup-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="newsletter-popup__input min-w-0 flex-1 rounded-md border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-[13.5px] text-white outline-none placeholder:text-white/30 focus:border-white/50 focus:bg-white/10"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="newsletter-popup__btn inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#f5f274] px-4 py-2.5 text-[13px] font-semibold text-[#063b32] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Sign up
                </button>
              </div>
              {status === 'error' && (
                <p className="mt-2 text-[11px] text-red-300">{error}</p>
              )}
              <p className="mt-3 text-[11px] leading-[1.5] text-white/35">
                By submitting you consent to receive VAxAI newsletter emails. You can unsubscribe
                at any time. We will not share your details.
              </p>
            </form>

            <button
              type="button"
              onClick={dismiss}
              className="mt-4 text-[11.5px] text-white/35 underline-offset-2 transition-colors hover:text-white/60 hover:underline"
            >
              No thanks, close
            </button>
          </>
        )}
      </div>
    </div>
  )
}