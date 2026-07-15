import Link from "next/link";

export default function StudioForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F8F8] px-6">
      <div className="max-w-md rounded-2xl border border-[#111111]/10 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#122428]">VAxAI Studio</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#111111]">Access not available</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5F686A]">
          Your account is signed in but is not registered as a VAxAI Studio member.
          Contact a platform admin if you believe this is a mistake.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/admin/login"
            className="rounded-xl bg-[#122428] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1B343A]"
          >
            Back to sign in
          </Link>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-xl border border-[#111111]/15 px-4 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#F5F8F8]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}