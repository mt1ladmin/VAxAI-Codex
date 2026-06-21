export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  support_type: string;
  preferred_contact: string;
  telephone: string | null;
  details: string;
  wants_discovery_call: boolean;
};

async function getEnquiries(): Promise<{ data: Enquiry[]; error: string | null }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { data: [], error: "Supabase environment variables are not configured." };
  }
  try {
    const { createServiceClient } = await import("@/lib/supabase");
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: (data as Enquiry[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

async function getUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const { createSessionClient } = await import("@/lib/supabase");
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/admin/login");

  const { data: enquiries, error } = await getEnquiries();

  return (
    <div className="min-h-screen bg-[#f7f4ea] px-4 py-10 font-sans md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#111111]">Enquiries</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#063b32] px-4 py-1.5 text-xs font-semibold text-[#f5f274]">
              Admin
            </span>
            <form action="/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded-full border border-[#111111]/15 bg-white px-4 py-1.5 text-xs font-semibold text-[#6f6b62] transition-colors hover:border-[#111111]/30 hover:text-[#111111]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-semibold">Configuration needed</p>
            <p className="mt-1">{error}</p>
            <p className="mt-3 text-xs leading-5 text-red-600">
              Add <code className="rounded bg-red-100 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
              <code className="rounded bg-red-100 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
              <code className="rounded bg-red-100 px-1 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> to your Vercel environment variables.
            </p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="rounded-md border border-[#111111]/10 bg-white p-10 text-center text-sm text-[#6f6b62]">
            No enquiries yet. Submitted contact forms will appear here.
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-sm text-[#6f6b62]">{enquiries.length} enquir{enquiries.length === 1 ? "y" : "ies"}</p>
            {enquiries.map((e) => (
              <div
                key={e.id}
                className="rounded-md border border-[#111111]/10 bg-white p-6 shadow-[0_4px_20px_rgba(17,17,17,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#111111]">{e.name}</p>
                    <a
                      href={`mailto:${e.email}`}
                      className="mt-0.5 block text-sm text-[#063b32] underline"
                    >
                      {e.email}
                    </a>
                    {e.telephone && (
                      <p className="mt-0.5 text-sm text-[#6f6b62]">{e.telephone}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f5f274]/80 px-3 py-1 text-xs font-semibold text-[#111111]">
                      {e.support_type}
                    </span>
                    <span className="rounded-full border border-[#111111]/10 px-3 py-1 text-xs text-[#6f6b62]">
                      via {e.preferred_contact}
                    </span>
                    {e.wants_discovery_call && (
                      <span className="rounded-full bg-[#063b32] px-3 py-1 text-xs font-semibold text-[#f5f274]">
                        Discovery call requested
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap rounded-md bg-[#f7f4ea] p-4 text-sm leading-6 text-[#6f6b62]">
                  {e.details}
                </p>
                <p className="mt-3 text-xs text-[#6f6b62]/50">
                  Received{" "}
                  {new Date(e.created_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
