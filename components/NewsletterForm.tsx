'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'done') {
    return (
      <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted">
        <Check className="h-3.5 w-3.5 text-pine-800" /> You&rsquo;re subscribed, thank you.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-md">
      <label
        htmlFor="footer-newsletter-email"
        className="block text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70"
      >
        Subscribe to our newsletter
      </label>
      <div className="mt-3 flex items-center gap-2">
        <input
          id="footer-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="min-w-0 flex-1 rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-pine-800"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pine-900 px-4 py-2.5 text-xs font-semibold text-acid transition-colors duration-300 hover:bg-pine-800 disabled:opacity-50"
        >
          {status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
          Subscribe
        </button>
      </div>
      {status === 'error' && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </form>
  )
}