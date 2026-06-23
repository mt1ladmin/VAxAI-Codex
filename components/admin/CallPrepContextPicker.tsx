"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, X, Zap } from "lucide-react";
import type { PainPoint, Persona, SectorProfile } from "@/lib/engagement/types";

type CallPrepContextPickerProps = {
  sector: SectorProfile | null;
  persona: Persona | null;
  painPoints: PainPoint[];
  onSectorChange: (sector: SectorProfile | null) => void;
  onPersonaChange: (persona: Persona | null) => void;
  onPainPointsChange: (painPoints: PainPoint[]) => void;
};

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#063b32]/10 px-2.5 py-1 text-xs font-semibold text-[#063b32]">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-red-600">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function CallPrepContextPicker({
  sector,
  persona,
  painPoints,
  onSectorChange,
  onPersonaChange,
  onPainPointsChange,
}: CallPrepContextPickerProps) {
  const [sectorSearch, setSectorSearch] = useState("");
  const [personaSearch, setPersonaSearch] = useState("");
  const [painSearch, setPainSearch] = useState("");
  const [sectorResults, setSectorResults] = useState<SectorProfile[]>([]);
  const [personaResults, setPersonaResults] = useState<Persona[]>([]);
  const [painResults, setPainResults] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!sectorSearch.trim()) { setSectorResults([]); return; }
    const t = setTimeout(() => {
      void (async () => {
        setLoading("sector");
        const res = await fetch(`/api/admin/engagement/sectors?q=${encodeURIComponent(sectorSearch.trim())}`);
        const j = await res.json() as { data?: SectorProfile[] };
        setSectorResults((j.data || []).slice(0, 6));
        setLoading(null);
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [sectorSearch]);

  useEffect(() => {
    if (!personaSearch.trim()) { setPersonaResults([]); return; }
    const t = setTimeout(() => {
      void (async () => {
        setLoading("persona");
        const res = await fetch(`/api/admin/engagement/personas?q=${encodeURIComponent(personaSearch.trim())}`);
        const j = await res.json() as { data?: Persona[] };
        setPersonaResults((j.data || []).slice(0, 6));
        setLoading(null);
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [personaSearch]);

  useEffect(() => {
    if (!painSearch.trim()) { setPainResults([]); return; }
    const t = setTimeout(() => {
      void (async () => {
        setLoading("pain");
        const params = new URLSearchParams({ q: painSearch.trim() });
        if (sector?.name) params.set("sector", sector.name);
        const res = await fetch(`/api/admin/engagement/pain-points?${params}`);
        const j = await res.json() as { data?: PainPoint[] };
        setPainResults((j.data || []).filter((p) => !painPoints.some((x) => x.id === p.id)).slice(0, 6));
        setLoading(null);
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [painSearch, sector, painPoints]);

  const SearchField = ({
    label,
    value,
    onChange,
    placeholder,
    id,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    id: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6f6b62]" />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
        />
        {loading === id && (
          <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[#6f6b62]" />
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/30 p-4 space-y-4">
      <div>
        <p className="text-xs font-semibold text-[#111111]">Call context</p>
        <p className="mt-0.5 text-xs text-[#6f6b62]">
          Add sector, persona, and pain points to help the assistant understand this call.
        </p>
      </div>

      <SearchField id="sector" label="Sector" value={sectorSearch} onChange={setSectorSearch} placeholder="Search sectors…" />
      {sector ? (
        <Chip label={sector.name} onRemove={() => onSectorChange(null)} />
      ) : sectorResults.length > 0 && (
        <div className="rounded-lg border border-[#111111]/10 bg-white overflow-hidden">
          {sectorResults.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { onSectorChange(s); setSectorSearch(""); setSectorResults([]); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] border-b border-[#111111]/5 last:border-0"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <SearchField id="persona" label="Persona" value={personaSearch} onChange={setPersonaSearch} placeholder="Search personas…" />
      {persona ? (
        <Chip label={persona.persona_name} onRemove={() => onPersonaChange(null)} />
      ) : personaResults.length > 0 && (
        <div className="rounded-lg border border-[#111111]/10 bg-white overflow-hidden">
          {personaResults.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onPersonaChange(p); setPersonaSearch(""); setPersonaResults([]); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] border-b border-[#111111]/5 last:border-0"
            >
              {p.persona_name}
            </button>
          ))}
        </div>
      )}

      <SearchField id="pain" label="Pain points" value={painSearch} onChange={setPainSearch} placeholder="Search pain points…" />
      {painPoints.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {painPoints.map((pp) => (
            <span key={pp.id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
              <Zap className="h-3 w-3" />
              {pp.title}
              <button type="button" onClick={() => onPainPointsChange(painPoints.filter((x) => x.id !== pp.id))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {painResults.length > 0 && (
        <div className="rounded-lg border border-[#111111]/10 bg-white overflow-hidden">
          {painResults.map((pp) => (
            <button
              key={pp.id}
              type="button"
              onClick={() => { onPainPointsChange([...painPoints, pp]); setPainSearch(""); setPainResults([]); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] border-b border-[#111111]/5 last:border-0"
            >
              {pp.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}