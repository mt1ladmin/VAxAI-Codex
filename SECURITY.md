# Security posture

Last reviewed: 2026-07-15

## Controls in place

- **Auth:** Supabase session gate for `/admin` and `/api/admin` (role checks in middleware).
- **Public APIs:** Rate limiting, payload size limits, input allowlists/length caps on enquiry, newsletter and public posts.
- **Least privilege (writes):** Public write paths prefer the Supabase **anon** key so RLS can constrain inserts; service role is not required for public forms.
- **Cron/batch:** Bearer secrets required (`CRON_SECRET` / `AI_BATCH_SECRET`); constant-time compare; fail closed when missing.
- **XSS:** HTML sanitisation before rendering CMS/post body content.
- **Headers:** HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP, `poweredByHeader` disabled.
- **Cookies/privacy:** Explicit cookie consent before analytics; necessary/analytics/marketing categories.

## Production checklist

1. Set `CRON_SECRET` / `AI_BATCH_SECRET` in Vercel (strong random values).
2. Ensure Supabase **RLS** is enabled with policies that only allow:
   - `anon` **insert** on `enquiries` and `newsletter_subscribers` (column-limited if possible)
   - `anon` **select** of `posts` where `status = 'published'`
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only (never `NEXT_PUBLIC_`).
4. Enable Vercel Attack Challenge / WAF for additional edge rate limiting.
5. Review sub-processors in the Privacy Policy when tools change (Calendly, Vercel Analytics, Anthropic, Supabase).

## Residual risks

- In-memory rate limits are per instance; edge/WAF still recommended.
- CSP allows `'unsafe-inline'` / `'unsafe-eval'` for Next.js + Calendly; tighten with nonces when feasible.
- Service role may still be used for some server-rendered post reads depending on RLS readiness.
