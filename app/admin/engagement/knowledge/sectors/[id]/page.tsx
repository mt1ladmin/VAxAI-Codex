"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { type SectorProfile } from "@/lib/engagement/types";

const INPUT = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#063b32]";
const TEXTAREA = `${INPUT} resize-none`;

function TagsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  return (
    <div className="rounded-lg border border-[#111111]/15 bg-white p-2 focus-within:border-[#063b32]">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-xs font-semibold text-[#6f6b62]">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-red-500 leading-none">×</button>
          </span>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder="Type and press Enter to add"
        className="w-full bg-transparent text-sm outline-none text-[#111111] placeholder:text-[#6f6b62]" />
    </div>
  );
}

function ListEditor({ value, onChange, rows = 4 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  return (
    <textarea rows={rows} value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
      placeholder="One item per line" className={TEXTAREA} />
  );
}

function ReadList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-[#111111]">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#063b32]/40 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <div className="bg-[#f7f4ea] px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#063b32]/20 overflow-hidden">
      <div className="bg-[#063b32]/8 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#063b32]">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

type Draft = {
  name: string;
  description: string;
  common_operating_model: string;
  starting_language: string;
  audience_types: string[];
  common_admin_pressures: string[];
  typical_stakeholders: string[];
  common_systems: string[];
  common_data_types: string[];
  relevant_risk_areas: string[];
  questions_to_explore: string[];
  common_objections: string[];
  potential_pathways: string[];
  evidence_sources: string[];
};

function sectorToDraft(s: SectorProfile): Draft {
  return {
    name: s.name,
    description: s.description ?? "",
    common_operating_model: s.common_operating_model ?? "",
    starting_language: s.starting_language ?? "",
    audience_types: s.audience_types ?? [],
    common_admin_pressures: s.common_admin_pressures ?? [],
    typical_stakeholders: s.typical_stakeholders ?? [],
    common_systems: s.common_systems ?? [],
    common_data_types: s.common_data_types ?? [],
    relevant_risk_areas: s.relevant_risk_areas ?? [],
    questions_to_explore: s.questions_to_explore ?? [],
    common_objections: s.common_objections ?? [],
    potential_pathways: s.potential_pathways ?? [],
    evidence_sources: s.evidence_sources ?? [],
  };
}

export default function SectorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sector, setSector] = useState<SectorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/engagement/sectors/${id}`);
    if (!res.ok) { setLoading(false); return; }
    const json = await res.json() as { data: SectorProfile };
    setSector(json.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const startEdit = () => {
    if (!sector) return;
    setDraft(sectorToDraft(sector));
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setDraft(null); };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      common_operating_model: draft.common_operating_model.trim() || null,
      starting_language: draft.starting_language.trim() || null,
      audience_types: draft.audience_types.length ? draft.audience_types : null,
      common_admin_pressures: draft.common_admin_pressures.length ? draft.common_admin_pressures : null,
      typical_stakeholders: draft.typical_stakeholders.length ? draft.typical_stakeholders : null,
      common_systems: draft.common_systems.length ? draft.common_systems : null,
      common_data_types: draft.common_data_types.length ? draft.common_data_types : null,
      relevant_risk_areas: draft.relevant_risk_areas.length ? draft.relevant_risk_areas : null,
      questions_to_explore: draft.questions_to_explore.length ? draft.questions_to_explore : null,
      common_objections: draft.common_objections.length ? draft.common_objections : null,
      potential_pathways: draft.potential_pathways.length ? draft.potential_pathways : null,
      evidence_sources: draft.evidence_sources.length ? draft.evidence_sources : null,
    };
    await fetch(`/api/admin/engagement/sectors/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setEditing(false);
    setDraft(null);
    await load();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/sectors/${id}`, { method: "DELETE" });
    setDeleting(false);
    router.push("/admin/engagement/knowledge?tab=sectors");
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => d ? { ...d, [key]: value } : d);

  if (loading) return <div className="p-12 text-center text-sm text-[#6f6b62]">Loading…</div>;
  if (!sector) return <div className="p-12 text-center text-sm text-red-600">Sector not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <RecordBackNav href="/admin/engagement/knowledge" backLabel="Knowledge library" title={editing ? (draft?.name || sector.name) : sector.name} />

      {/* Header */}
      <div className="border-b border-[#111111]/8 bg-white px-8 pb-6 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Sector profile</p>

        {editing && draft ? (
          <div className="mt-3 space-y-3 max-w-2xl">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Sector name
              <input value={draft.name} onChange={(e) => set("name", e.target.value)} className={`mt-1 ${INPUT}`} />
            </label>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Description
              <textarea rows={2} value={draft.description} onChange={(e) => set("description", e.target.value)} className={`mt-1 ${TEXTAREA}`} />
            </label>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Audience types
              <div className="mt-1"><TagsEditor value={draft.audience_types} onChange={(v) => set("audience_types", v)} /></div>
            </label>
          </div>
        ) : (
          <>
            {sector.description && <p className="mt-1 max-w-2xl text-sm text-[#6f6b62]">{sector.description}</p>}
            {sector.audience_types && sector.audience_types.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sector.audience_types.map((a) => <span key={a} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{a}</span>)}
              </div>
            )}
          </>
        )}

        {/* Edit / Save / Delete controls */}
        <div className="mt-4 flex items-center gap-2">
          {editing ? (
            <>
              <button type="button" onClick={cancelEdit} disabled={saving} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"><X className="h-3.5 w-3.5" /> Cancel</button>
              <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save changes"}</button>
            </>
          ) : (
            <>
              <button type="button" onClick={startEdit} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:border-[#063b32] hover:text-[#063b32]"><Pencil className="h-3.5 w-3.5" /> Edit</button>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-red-600">Delete this sector?</span>
                  <button type="button" onClick={() => void del()} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-red-700">{deleting ? "Deleting…" : "Yes, delete"}</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:border-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-6 space-y-4">
        {editing && draft ? (
          <>
            <EditSection title="How this sector typically operates">
              <textarea rows={3} value={draft.common_operating_model} onChange={(e) => set("common_operating_model", e.target.value)} className={TEXTAREA} placeholder="Describe how this sector typically operates…" />
            </EditSection>

            <EditSection title="Common admin pressures">
              <ListEditor value={draft.common_admin_pressures} onChange={(v) => set("common_admin_pressures", v)} rows={5} />
            </EditSection>

            <EditSection title="Typical stakeholders">
              <TagsEditor value={draft.typical_stakeholders} onChange={(v) => set("typical_stakeholders", v)} />
            </EditSection>

            <EditSection title="Common systems and tools">
              <TagsEditor value={draft.common_systems} onChange={(v) => set("common_systems", v)} />
            </EditSection>

            <EditSection title="Common data types">
              <ListEditor value={draft.common_data_types} onChange={(v) => set("common_data_types", v)} />
            </EditSection>

            <EditSection title="Risk areas to be aware of">
              <TagsEditor value={draft.relevant_risk_areas} onChange={(v) => set("relevant_risk_areas", v)} />
            </EditSection>

            <EditSection title="Language to use when starting a conversation">
              <textarea rows={3} value={draft.starting_language} onChange={(e) => set("starting_language", e.target.value)} className={TEXTAREA} placeholder="Opening language…" />
            </EditSection>

            <EditSection title="Questions to explore">
              <ListEditor value={draft.questions_to_explore} onChange={(v) => set("questions_to_explore", v)} />
            </EditSection>

            <EditSection title="Common objections in this sector">
              <ListEditor value={draft.common_objections} onChange={(v) => set("common_objections", v)} />
            </EditSection>

            <EditSection title="Potential service pathways">
              <ListEditor value={draft.potential_pathways} onChange={(v) => set("potential_pathways", v)} />
            </EditSection>

            <EditSection title="Evidence and sources">
              <ListEditor value={draft.evidence_sources} onChange={(v) => set("evidence_sources", v)} rows={3} />
            </EditSection>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={cancelEdit} disabled={saving} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"><X className="h-3.5 w-3.5" /> Cancel</button>
              <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save changes"}</button>
            </div>
          </>
        ) : (
          <>
            {sector.common_operating_model && (
              <Section title="How this sector typically operates">
                <p className="text-sm text-[#111111]">{sector.common_operating_model}</p>
              </Section>
            )}

            {sector.common_admin_pressures && sector.common_admin_pressures.length > 0 && (
              <Section title="Common admin pressures"><ReadList items={sector.common_admin_pressures} /></Section>
            )}

            {sector.typical_stakeholders && sector.typical_stakeholders.length > 0 && (
              <Section title="Typical stakeholders">
                <div className="flex flex-wrap gap-2">
                  {sector.typical_stakeholders.map((s) => <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{s}</span>)}
                </div>
              </Section>
            )}

            {sector.common_systems && sector.common_systems.length > 0 && (
              <Section title="Common systems and tools">
                <div className="flex flex-wrap gap-2">
                  {sector.common_systems.map((s) => <span key={s} className="rounded-full bg-[#f7f4ea] px-3 py-1 text-xs font-semibold text-[#6f6b62]">{s}</span>)}
                </div>
              </Section>
            )}

            {sector.common_data_types && sector.common_data_types.length > 0 && (
              <Section title="Common data types"><ReadList items={sector.common_data_types} /></Section>
            )}

            {sector.relevant_risk_areas && sector.relevant_risk_areas.length > 0 && (
              <Section title="Risk areas to be aware of">
                <div className="flex flex-wrap gap-2">
                  {sector.relevant_risk_areas.map((r) => <span key={r} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{r}</span>)}
                </div>
              </Section>
            )}

            {sector.starting_language && (
              <Section title="Language to use when starting a conversation">
                <p className="text-sm text-[#111111] italic">&ldquo;{sector.starting_language}&rdquo;</p>
              </Section>
            )}

            {sector.questions_to_explore && sector.questions_to_explore.length > 0 && (
              <Section title="Questions to explore"><ReadList items={sector.questions_to_explore} /></Section>
            )}

            {sector.common_objections && sector.common_objections.length > 0 && (
              <Section title="Common objections in this sector">
                <div className="space-y-2">
                  {sector.common_objections.map((o, i) => (
                    <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                      <p className="text-sm text-[#111111] italic">&ldquo;{o}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {sector.potential_pathways && sector.potential_pathways.length > 0 && (
              <Section title="Potential service pathways"><ReadList items={sector.potential_pathways} /></Section>
            )}

            {sector.evidence_sources && sector.evidence_sources.length > 0 && (
              <Section title="Evidence and sources">
                <ul className="space-y-1">
                  {sector.evidence_sources.map((s, i) => (
                    <li key={i} className="text-sm text-[#063b32] hover:underline">
                      {s.startsWith("http") ? <a href={s} target="_blank" rel="noopener noreferrer">{s}</a> : s}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
