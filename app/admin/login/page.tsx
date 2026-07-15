"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Site nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm md:px-8">
        <SiteNav variant="light" />
      </header>

      {/* Login form — centred in remaining space */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-xl bg-pine-900 px-4 py-3">
              <img src="/vaxai-logo.png" alt="VAxAI" className="h-8 w-auto" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pine-700">VAxAI Studio</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-pine-900">Sign in</h1>
            <p className="mt-1 text-sm text-muted">Team access to engagement and content tools</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-pine-900/10 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-acid px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:brightness-[1.04] disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SiteFooter />
      <SimplifiedModeToggle />
    </div>
  );
}
