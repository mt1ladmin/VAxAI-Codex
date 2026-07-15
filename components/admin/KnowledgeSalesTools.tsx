"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Pencil, Search, Trash2, X } from "lucide-react";
import type { EngagementScript, Objection, PricingRule } from "@/lib/engagement/types";
import { AppSelect } from "@/components/ui/AppSelect";

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-pine-900/10 text-pine-900",
  linkedin: "bg-pine-100 text-pine-800",
  phone: "bg-pine-50 text-pine-900 border border-pine-900/12",
  "in-person": "bg-acid/50 text-ink",
  general: "bg-white text-muted border border-pine-900/12",
};

function normalize(value: string | null | undefined): string {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupeBy<T>(items: T[], keyFor: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFor(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function copyToClipboard(text: string, setCopied: (id: string) => void, id: string) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  });
}

const INPUT = "w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm text-[#111111] outline-none focus:border-[#122428] normal-case tracking-normal";
const TEXTAREA = `${INPUT} resize-none`;

function ConfirmDelete({ onConfirm, onCancel, saving }: { onConfirm: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-600 font-semibold">Delete this item?</span>
      <button type="button" onClick={onConfirm} disabled={saving} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-red-700">
        {saving ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" onClick={onCancel} className="rounded-lg border border-[#111111]/15 px-3 py-1 text-xs font-semibold text-[#5F686A] hover:bg-pine-50">Cancel</button>
    </div>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────

type PricingDraft = {
  name: string; category: string; unit: string; description: string;
  band_low: string; band_expected: string; band_high: string;
};

function PricingCard({ rule, onSaved }: { rule: PricingRule; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState<PricingDraft>({
    name: rule.name, category: rule.category, unit: rule.unit,
    description: rule.description ?? "",
    band_low: rule.band_low != null ? String(rule.band_low) : "",
    band_expected: rule.band_expected != null ? String(rule.band_expected) : "",
    band_high: rule.band_high != null ? String(rule.band_high) : "",
  });

  const resetDraft = () => setDraft({
    name: rule.name, category: rule.category, unit: rule.unit,
    description: rule.description ?? "",
    band_low: rule.band_low != null ? String(rule.band_low) : "",
    band_expected: rule.band_expected != null ? String(rule.band_expected) : "",
    band_high: rule.band_high != null ? String(rule.band_high) : "",
  });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/pricing/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name.trim(), category: draft.category.trim(), unit: draft.unit.trim(),
        description: draft.description.trim() || null,
        band_low: draft.band_low !== "" ? Number(draft.band_low) : null,
        band_expected: draft.band_expected !== "" ? Number(draft.band_expected) : null,
        band_high: draft.band_high !== "" ? Number(draft.band_high) : null,
      }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/pricing/${rule.id}`, { method: "DELETE" });
    setDeleting(false);
    onSaved();
  };

  if (!editing) {
    return (
      <div className="rounded-xl border border-[#111111]/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-[#111111]">{rule.name}</p>
            <p className="text-xs text-[#5F686A]">{rule.category} · {rule.unit}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#122428]">£{(rule.band_low ?? 0).toLocaleString()} – £{(rule.band_high ?? 0).toLocaleString()}</p>
              {rule.band_expected != null && <p className="text-xs text-[#5F686A]">Expected: £{rule.band_expected.toLocaleString()}</p>}
            </div>
            {confirmDelete ? (
              <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
            ) : (
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setEditing(true)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#111111]/15 text-[#5F686A] hover:border-[#122428] hover:text-[#122428]"><Pencil className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setConfirmDelete(true)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#111111]/15 text-[#5F686A] hover:border-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
        </div>
        {rule.description && <p className="mt-2 text-sm text-[#5F686A]">{rule.description}</p>}
        {rule.inclusions && rule.inclusions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rule.inclusions.map((i) => <span key={i} className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#5F686A]">{i}</span>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#122428]/30 p-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Name<input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Category<input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
      </div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Unit<input value={draft.unit} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
      <div className="grid grid-cols-3 gap-3">
        {([["band_low", "Band low (£)"], ["band_expected", "Expected (£)"], ["band_high", "Band high (£)"]] as [keyof Pick<PricingDraft, "band_low" | "band_expected" | "band_high">, string][]).map(([key, label]) => (
          <label key={key} className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">{label}<input type="number" value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
        ))}
      </div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Description<textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={2} className={`mt-1 ${TEXTAREA}`} /></label>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={() => { resetDraft(); setEditing(false); }} disabled={saving} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#5F686A] hover:bg-pine-50"><X className="h-3.5 w-3.5" /> Cancel</button>
        <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}

export function PricingBandsPanel() {
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/engagement/pricing?limit=100");
    const json = await res.json() as { data: PricingRule[] };
    setPricing(dedupeBy(json.data || [], (rule) => [
      normalize(rule.name), normalize(rule.category), normalize(rule.unit),
      rule.band_low ?? "", rule.band_expected ?? "", rule.band_high ?? "",
    ].join("|")));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <Loading />;
  if (pricing.length === 0) return <Empty>No pricing bands found.</Empty>;
  return <div className="space-y-3">{pricing.map((rule) => <PricingCard key={rule.id} rule={rule} onSaved={() => void load()} />)}</div>;
}

// ── Scripts & Blocks ───────────────────────────────────────────────────────

function ScriptCard({ script, onSaved }: { script: EngagementScript; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState({
    title: script.title, channel: script.channel, block_type: script.block_type ?? "",
    tone: script.tone ?? "", audience_type: script.audience_type ?? "", content: script.content,
  });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/scripts/${script.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title.trim(), channel: draft.channel,
        block_type: draft.block_type.trim() || null, tone: draft.tone.trim() || null,
        audience_type: draft.audience_type.trim() || null, content: draft.content.trim(),
      }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/scripts/${script.id}`, { method: "DELETE" });
    setDeleting(false);
    onSaved();
  };

  if (!editing) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#111111]">{script.title}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${CHANNEL_COLORS[script.channel] || "bg-gray-100 text-gray-600"}`}>{script.channel}</span>
              {[script.block_type, script.tone].filter(Boolean).map((tag) => <span key={tag} className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#5F686A]">{tag}</span>)}
              {script.audience_type && <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">{script.audience_type}</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {confirmDelete ? (
              <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
            ) : (
              <>
                <CopyButton copied={copied} onClick={() => { copyToClipboard(script.content, () => setCopied(true), script.id); setTimeout(() => setCopied(false), 2000); }} />
                <button type="button" onClick={() => setEditing(true)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#111111]/15 text-[#5F686A] hover:border-[#122428] hover:text-[#122428]"><Pencil className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setConfirmDelete(true)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#111111]/15 text-[#5F686A] hover:border-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-white px-4 py-3"><p className="whitespace-pre-wrap text-sm text-[#111111]">{script.content}</p></div>
        {script.last_reviewed && <p className="mt-2 text-[10px] text-[#5F686A]">Reviewed {new Date(script.last_reviewed).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}{script.content_owner ? ` by ${script.content_owner}` : ""}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#122428]/30 bg-white p-5">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Title<input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Channel
          <select value={draft.channel} onChange={(e) => setDraft((d) => ({ ...d, channel: e.target.value }))} className={`mt-1 ${INPUT}`}>
            {["email", "linkedin", "phone", "in-person", "general"].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </label>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Block type<input value={draft.block_type} onChange={(e) => setDraft((d) => ({ ...d, block_type: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Tone<input value={draft.tone} onChange={(e) => setDraft((d) => ({ ...d, tone: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Audience type<input value={draft.audience_type} onChange={(e) => setDraft((d) => ({ ...d, audience_type: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
      </div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Content<textarea rows={6} value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} className={`mt-1 ${TEXTAREA}`} /></label>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={() => setEditing(false)} disabled={saving} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#5F686A] hover:bg-pine-50"><X className="h-3.5 w-3.5" /> Cancel</button>
        <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}

export function ScriptsBlocksPanel() {
  const [scripts, setScripts] = useState<EngagementScript[]>([]);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("q", search);
    if (channel) params.set("channel", channel);
    const res = await fetch(`/api/admin/engagement/scripts?${params}`);
    const json = await res.json() as { data: EngagementScript[] };
    setScripts(dedupeBy(json.data || [], (script) => [
      normalize(script.title), normalize(script.channel), normalize(script.block_type), normalize(script.content),
    ].join("|")));
    setLoading(false);
  }, [search, channel]);

  useEffect(() => { const t = setTimeout(() => { void load(); }, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div>
      <div className="mb-5 flex gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F686A]" />
          <input ref={inputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search scripts…" className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#122428]" />
        </div>
        <AppSelect value={channel} onChange={setChannel} options={["email", "linkedin", "phone", "in-person", "general"].map((item) => ({ value: item, label: item.charAt(0).toUpperCase() + item.slice(1) }))} placeholder="All channels" size="sm" className="min-w-[9rem]" />
      </div>
      {loading ? <Loading /> : scripts.length === 0 ? <Empty>No scripts found.</Empty> : (
        <div className="space-y-3">
          {scripts.map((script) => <ScriptCard key={script.id} script={script} onSaved={() => void load()} />)}
        </div>
      )}
    </div>
  );
}

// ── Objections ─────────────────────────────────────────────────────────────

function ObjectionCard({ objection, onSaved }: { objection: Objection; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState({
    objection: objection.objection, response: objection.response,
    category: objection.category ?? "", tone: objection.tone ?? "",
  });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/objections/${objection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objection: draft.objection.trim(), response: draft.response.trim(),
        category: draft.category.trim() || null, tone: draft.tone.trim() || null,
      }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/objections/${objection.id}`, { method: "DELETE" });
    setDeleting(false);
    onSaved();
  };

  if (!editing) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2">
              {[objection.category, objection.tone].filter(Boolean).map((tag) => <span key={tag} className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#5F686A]">{tag}</span>)}
            </div>
            <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">Objection</p>
              <p className="text-sm italic text-[#111111]">&ldquo;{objection.objection}&rdquo;</p>
            </div>
            <div className="rounded-lg border border-[#122428]/15 bg-[#122428]/5 px-4 py-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#122428]">Response</p>
              <p className="text-sm text-[#111111]">{objection.response}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            {confirmDelete ? (
              <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
            ) : (
              <>
                <CopyButton copied={copied} onClick={() => { copyToClipboard(objection.response, () => setCopied(true), objection.id); setTimeout(() => setCopied(false), 2000); }} />
                <button type="button" onClick={() => setEditing(true)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#111111]/15 text-[#5F686A] hover:border-[#122428] hover:text-[#122428]"><Pencil className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setConfirmDelete(true)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#111111]/15 text-[#5F686A] hover:border-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#122428]/30 bg-white p-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Category
          <select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className={`mt-1 ${INPUT}`}>
            <option value="">None</option>
            {["Cost", "Trust", "Relevance", "Timing", "AI concerns", "Process", "General"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Tone<input value={draft.tone} onChange={(e) => setDraft((d) => ({ ...d, tone: e.target.value }))} className={`mt-1 ${INPUT}`} /></label>
      </div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Objection
        <div className="mt-1 rounded-lg border border-amber-100 bg-amber-50 p-3">
          <textarea rows={2} value={draft.objection} onChange={(e) => setDraft((d) => ({ ...d, objection: e.target.value }))} className="w-full bg-transparent text-sm italic text-[#111111] outline-none resize-none" />
        </div>
      </label>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Response
        <div className="mt-1 rounded-lg border border-[#122428]/15 bg-[#122428]/5 p-3">
          <textarea rows={3} value={draft.response} onChange={(e) => setDraft((d) => ({ ...d, response: e.target.value }))} className="w-full bg-transparent text-sm text-[#111111] outline-none resize-none" />
        </div>
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={() => setEditing(false)} disabled={saving} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#5F686A] hover:bg-pine-50"><X className="h-3.5 w-3.5" /> Cancel</button>
        <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}

export function ObjectionsPanel() {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    const res = await fetch(`/api/admin/engagement/objections?${params}`);
    const json = await res.json() as { data: Objection[] };
    setObjections(dedupeBy(json.data || [], (o) => [normalize(o.objection), normalize(o.response), normalize(o.category)].join("|")));
    setLoading(false);
  }, [search, category]);

  useEffect(() => { const t = setTimeout(() => { void load(); }, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div>
      <div className="mb-5 flex gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F686A]" />
          <input ref={inputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search objections…" className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#122428]" />
        </div>
        <AppSelect value={category} onChange={setCategory} options={["Cost", "Trust", "Relevance", "Timing", "AI concerns", "Process", "General"].map((item) => ({ value: item, label: item }))} placeholder="All categories" size="sm" className="min-w-[9rem]" />
      </div>
      {loading ? <Loading /> : objections.length === 0 ? <Empty>No objections found.</Empty> : (
        <div className="space-y-3">
          {objections.map((obj) => <ObjectionCard key={obj.id} objection={obj} onSaved={() => void load()} />)}
        </div>
      )}
    </div>
  );
}

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${copied ? "border-pine-900 bg-acid/50 text-ink" : "border-[#111111]/15 text-[#5F686A] hover:border-[#122428] hover:text-[#122428]"}`}>
      <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Loading() { return <div className="py-16 text-center text-sm text-[#5F686A]">Loading…</div>; }
function Empty({ children }: { children: React.ReactNode }) { return <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#5F686A]">{children}</div>; }
