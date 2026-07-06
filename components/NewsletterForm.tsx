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
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600">
        <Check className="h-3.5 w-3.5 text-[#063b32]" /> You&rsquo;re subscribed, thank you.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-md">
      <label
        htmlFor="footer-newsletter-email"
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500"
      >
        Subscribe to our newsletter
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id="footer-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#111111] outline-none placeholder:text-gray-400 focus:border-[#063b32]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#063b32] px-3.5 py-2 text-xs font-semibold text-[#f5f274] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
          Subscribe
        </button>
      </div>
      {status === 'error' && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </form>
  )
}