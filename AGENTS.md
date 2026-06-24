# VAxAI-Codex Project Rules

## Repository

- **GitHub**: https://github.com/mt1ladmin/VAxAI-Codex
- **Local path**: `/Users/tgk-nkoula/VAxAI-Codex`
- **Default branch**: `main`

All code changes for this project must be made inside this repository.

## Git workflow (required)

After completing any requested change in this repo:

1. Work on the `main` branch. If on another branch, switch to `main` and pull first.
2. Stage all relevant changes (`git add` for modified files only — do not add secrets or local env files).
3. Commit with a clear, descriptive message summarizing what changed and why.
4. Push directly to `origin main` (`git push origin main`).
5. Confirm the push succeeded and report the commit hash to the user.

Do not leave completed work uncommitted. Do not open feature branches or PRs unless the user explicitly asks.

Before pushing, run `git pull --rebase origin main` if the remote may have moved ahead.

## Stack

- Next.js 15 app with TypeScript, TailScript, Supabase
- Admin engagement tooling under `app/admin/` and `components/admin/`
- Python data scripts under `scripts/`

## Quality checks

When changes touch application code, run `npm run lint` before committing when practical.