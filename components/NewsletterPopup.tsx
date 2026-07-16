'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { COOKIE_CONSENT_EVENT } from '@/components/CookieConsent'

const STORAGE_KEY = 'vaxai-newsletter-popup'
const COOKIE_STORAGE_KEY = 'vaxai-cookie-consent'
const DELAY_MS = 60_000

/** Dispatch from any page to open the same newsletter modal (e.g. “Sign up to our newsletter”). */
export const OPEN_NEWSLETTER_POPUP_EVENT = 'vaxai-open-newsletter-popup'

export function openNewsletterPopup() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_NEWSLETTER_POPUP_EVENT))
}

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
    function onOpenRequested() {
      // Intentional click — show even if the timed prompt was dismissed earlier
      setEmail('')
      setStatus('idle')
      setError('')
      setVisible(true)
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentDecided)
    window.addEventListener(OPEN_NEWSLETTER_POPUP_EVENT, onOpenRequested)
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentDecided)
      window.removeEventListener(OPEN_NEWSLETTER_POPUP_EVENT, onOpenRequested)
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
      className="newsletter-popup__backdrop fixed inset-0 z-[8800] flex items-end justify-center bg-ink/55 px-4 pb-6 backdrop-blur-md sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter sign-up"
    >
      <div className="newsletter-popup__panel relative w-full max-w-[460px] rounded-2xl border border-ink/10 bg-white px-6 py-7 text-ink shadow-[0_24px_64px_rgba(0,0,0,0.18)] sm:px-8 sm:py-9">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close newsletter sign-up"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-pine-700">
          VAxAI · Newsletter
        </p>

        {status === 'done' ? (
          <div className="mt-5 flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-900">
              <Check className="h-6 w-6 text-paper" />
            </span>
            <p className="text-[1.15rem] font-semibold leading-snug text-ink">
              You&rsquo;re subscribed
            </p>
            <p className="max-w-[28ch] text-[13.5px] leading-[1.65] text-muted">
              Thank you. You&rsquo;ll receive the latest VAxAI insights directly to your inbox.
            </p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="newsletter-popup__btn mt-2 rounded-md bg-pine-900 px-5 py-2.5 text-[13px] font-semibold text-paper transition-opacity hover:opacity-90"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="mt-3 text-[1.45rem] font-semibold leading-[1.2] text-ink sm:text-[1.6rem]">
              VAxAI&rsquo;s latest thinking, straight to your inbox
            </h2>

            <p className="mt-3 text-[13.5px] leading-[1.7] text-muted">
              Get practical insight on admin support, AI-assisted workflows and the VAT Framework,
              delivered directly to your inbox.
            </p>

            <form onSubmit={onSubmit} className="mt-6">
              <label
                htmlFor="popup-newsletter-email"
                className="block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted"
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
                  className="newsletter-popup__input min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-[13.5px] text-ink outline-none placeholder:text-muted focus:border-pine-900/35 focus:ring-2 focus:ring-pine-900/10"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="newsletter-popup__btn inline-flex shrink-0 items-center gap-1.5 rounded-md bg-pine-900 px-4 py-2.5 text-[13px] font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Sign up
                </button>
              </div>
              {status === 'error' && (
                <p className="mt-2 text-[11px] text-red-600">{error}</p>
              )}
              <p className="mt-3 text-[11px] leading-[1.5] text-muted">
                By submitting you consent to receive VAxAI newsletter emails. You can unsubscribe
                at any time. We will not share your details.
              </p>
            </form>

            <button
              type="button"
              onClick={dismiss}
              className="mt-4 text-[11.5px] text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
            >
              No thanks, close
            </button>
          </>
        )}
      </div>
    </div>
  )
}