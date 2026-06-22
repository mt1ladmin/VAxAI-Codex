"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Copy,
  FileEdit,
  Loader2,
  Phone,
  PhoneOff,
  Plus,
  Save,
  Search,
  Shield,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import type { EngagementContact, EngagementOrganisation, PainPoint, VatPrompt } from "@/lib/engagement/types";

type CallNote = { id: string; text: string; timestamp: Date; type: "note" | "pain_point" | "commitment" | "question" };
type CallState = "pre" | "active" | "post";
type AiMatch = { id: string; score: number; why: string; discovery_question: string; suggested_wording: string; pain_point?: PainPoint };
type StructuredNotes = {
  call_summary: string;
  confirmed_pain_points: string[];
  possible_pain_points: Array<{ topic: string; note: string }>;
  current_tools_mentioned: string[];
  admin_pressures_mentioned: string[];
  desired_outcomes: string[];
  agreed_next_steps: string[];
  follow_up_tasks: string[];
  possible_vaxai_support: string[];
  trust_concerns: string[];
  questions_raised: string[];
};

function LiveCallAssistInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callState, setCallState] = useState<CallState>("pre");
  const [callType, setCallType] = useState("prospecting");
  const [orgSearch, setOrgSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [orgs, setOrgs] = useState<EngagementOrganisation[]>([]);
  const [contacts, setContacts] = useState<EngagementContact[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<EngagementOrganisation | null>(null);
  const [selectedContact, setSelectedContact] = useState<EngagementContact | null>(null);
  const [notes, setNotes] = useState<CallNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<CallNote["type"]>("note");
  const [painPointSearch, setPainPointSearch] = useState("");
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPainPoints, setSelectedPainPoints] = useState<PainPoint[]>([]);
  const [activePainPoint, setActivePainPoint] = useState<PainPoint | null>(null);
  const [vatPrompts, setVatPrompts] = useState<VatPrompt[]>([]);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("0:00");
  const [showSummary, setShowSummary] = useState(false);
  const [summaryApproved, setSummaryApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiMatches, setAiMatches] = useState<AiMatch[]>([]);
  const [aiMatchError, setAiMatchError] = useState<string | null>(null);
  const [structuring, setStructuring] = useState(false);
  const [structuredNotes, setStructuredNotes] = useState<StructuredNotes | null>(null);
  const [structuredApproved, setStructuredApproved] = useState<Set<string>>(new Set());
  const [draftingFollowUp, setDraftingFollowUp] = useState(false);
  const [followUpDraft, setFollowUpDraft] = useState<{ draft: string; suggested_subject: string } | null>(null);
  const [followUpCopied, setFollowUpCopied] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Load pain point from URL if coming from navigator
  const initialPainPointId = searchParams.get("pain_point");

  useEffect(() => {
    if (initialPainPointId) {
      fetch(`/api/admin/engagement/pain-points/${initialPainPointId}`)
        .then((r) => r.json())
        .then((j: { data: PainPoint }) => {
          if (j.data) setSelectedPainPoints([j.data]);
        });
    }
  }, [initialPainPointId]);

  // Timer
  useEffect(() => {
    if (callState !== "active" || !callStartTime) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - callStartTime.getTime()) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState, callStartTime]);

  // Search orgs
  useEffect(() => {
    if (!orgSearch.trim()) { setOrgs([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/engagement/organisations?q=${encodeURIComponent(orgSearch)}&limit=5`);
      const j = await res.json() as { data: EngagementOrganisation[] };
      setOrgs(j.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [orgSearch]);

  // Search contacts
  useEffect(() => {
    if (!contactSearch.trim()) { setContacts([]); return; }
    const t = setTimeout(async () => {
      const params = new URLSearchParams({ q: contactSearch, limit: "5" });
      if (selectedOrg) params.set("organisation_id", selectedOrg.id);
      const res = await fetch(`/api/admin/engagement/contacts?${params}`);
      const j = await res.json() as { data: EngagementContact[] };
      setContacts(j.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [contactSearch, selectedOrg]);

  // Search pain points
  useEffect(() => {
    if (!painPointSearch.trim()) { setPainPoints([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/engagement/pain-points?q=${encodeURIComponent(painPointSearch)}&limit=8`);
      const j = await res.json() as { data: PainPoint[] };
      setPainPoints(j.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [painPointSearch]);

  const loadVatPrompts = useCallback(async (pp: PainPoint) => {
    const res = await fetch(`/api/admin/engagement/vat-prompts?tags=all`);
    const j = await res.json() as { data: VatPrompt[] };
    setVatPrompts(j.data || []);
    setActivePainPoint(pp);
  }, []);

  const addNote = (type: CallNote["type"] = "note") => {
    if (!noteText.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: noteText, timestamp: new Date(), type },
    ]);
    setNoteText("");
    noteRef.current?.focus();
  };

  const addPainPoint = (pp: PainPoint) => {
    if (selectedPainPoints.find((p) => p.id === pp.id)) return;
    setSelectedPainPoints((prev) => [...prev, pp]);
    setPainPointSearch("");
    setPainPoints([]);
    loadVatPrompts(pp);
    // Also add as a note chip
    setNotes((prev) => [...prev, {
      id: crypto.randomUUID(),
      text: `Pain point identified: ${pp.title}`,
      timestamp: new Date(),
      type: "pain_point",
    }]);
  };

  const runAiSearch = async () => {
    if (!painPointSearch.trim()) return;
    setAiSearching(true);
    setAiMatches([]);
    setAiMatchError(null);
    try {
      // Fetch a broad set of pain points to search across
      const res = await fetch(`/api/admin/engagement/pain-points?limit=100`);
      const j = await res.json() as { data: PainPoint[] };
      const allPainPoints = j.data || [];
      const searchRes = await fetch("/api/admin/engagement/ai/pain-point-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: painPointSearch,
          painPoints: allPainPoints.map(pp => ({
            id: pp.id, title: pp.title, category: pp.category,
            plain_english_definition: pp.plain_english_definition,
            what_person_says: pp.what_person_says,
          })),
          forceSemantic: true,  // Explicitly request AI semantic matching for the "AI match" button
        }),
      });
      if (!searchRes.ok) {
        const errText = await searchRes.text();
        console.error("AI match API error", errText);
        setAiMatchError("AI search failed (see console for details)");
        setAiMatches([]);
        return;
      }
      const sj = await searchRes.json() as { matches?: AiMatch[] };
      const matches = (sj.matches || []).map(m => ({
        ...m,
        pain_point: allPainPoints.find(pp => pp.id === m.id),
      }));
      setAiMatches(matches);
      if (matches.length === 0) {
        setAiMatchError("No good semantic matches found. Try a different description or use the keyword search.");
      }
    } catch (e) {
      console.error("AI match failed", e);
      setAiMatchError("AI match failed. Check Vercel logs or console.");
      setAiMatches([]);
    } finally {
      setAiSearching(false);
    }
  };

  const structureNotes = async () => {
    if (!notes.length) return;
    setStructuring(true);
    const rawNotes = notes.map(n => `[${noteTypeLabel[n.type]}] ${n.text}`).join("\n");
    const res = await fetch("/api/admin/engagement/ai/structure-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawNotes,
        callContext: {
          contactName: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name || ""}` : undefined,
          orgName: selectedOrg?.name,
          callType,
          duration: elapsed,
        },
      }),
    });
    const j = await res.json() as { data: StructuredNotes };
    if (j.data) {
      setStructuredNotes(j.data);
      // Pre-select all sections
      setStructuredApproved(new Set(Object.keys(j.data)));
    }
    setStructuring(false);
  };

  const generateFollowUp = async () => {
    setDraftingFollowUp(true);
    const summary = structuredNotes?.call_summary ||
      notes.map(n => n.text).join(". ");
    const nextSteps = structuredNotes?.agreed_next_steps || [];
    const res = await fetch("/api/admin/engagement/ai/follow-up-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interactionSummary: summary,
        nextSteps,
        contactName: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name || ""}` : undefined,
        orgName: selectedOrg?.name,
        callType,
        channel: "email",
      }),
    });
    const j = await res.json() as { data: { draft: string; suggested_subject: string } };
    if (j.data) setFollowUpDraft(j.data);
    setDraftingFollowUp(false);
  };

  const startCall = () => {
    setCallState("active");
    setCallStartTime(new Date());
    noteRef.current?.focus();
  };

  const endCall = () => {
    setCallState("post");
    setShowSummary(true);
  };

  const saveCallRecord = async () => {
    if (!summaryApproved) return;
    setSaving(true);
    const fullNotes = notes.map((n) => `[${n.timestamp.toLocaleTimeString()}] ${n.text}`).join("\n");
    const summary = `Call with ${selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name || ""}` : "unknown contact"} (${callType}). Duration: ${elapsed}. Pain points: ${selectedPainPoints.map((p) => p.title).join(", ") || "none identified"}.`;

    await fetch("/api/admin/engagement/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organisation_id: selectedOrg?.id || null,
        contact_id: selectedContact?.id || null,
        interaction_date: callStartTime?.toISOString() || new Date().toISOString(),
        interaction_type: callType,
        channel: "phone",
        direction: "outbound",
        summary,
        full_notes: fullNotes,
        pain_point_ids: selectedPainPoints.map((p) => p.id),
        outcome: "completed",
      }),
    });
    setSaving(false);
    router.push("/admin/engagement/pipeline/interactions");
  };

  const noteTypeColor: Record<string, string> = {
    note: "bg-white border-[#111111]/10",
    pain_point: "bg-amber-50 border-amber-200",
    commitment: "bg-emerald-50 border-emerald-200",
    question: "bg-blue-50 border-blue-200",
  };
  const noteTypeLabel: Record<string, string> = {
    note: "Note",
    pain_point: "Pain point",
    commitment: "Commitment",
    question: "Question",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-[#111111]">Live Call Assist</h1>
          </div>
          {callState === "active" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">{elapsed}</span>
              </div>
              <button
                onClick={endCall}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                <PhoneOff className="h-4 w-4" /> End call
              </button>
            </div>
          )}
        </div>
      </div>

      {callState === "pre" && (
        <div className="px-8 py-8 max-w-xl">
          <h2 className="text-lg font-semibold text-[#111111] mb-6">Set up this call</h2>

          {/* Call type */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-2">
              Call type
            </label>
            <div className="flex flex-wrap gap-2">
              {["prospecting","discovery","review","support","follow-up"].map((type) => (
                <button
                  key={type}
                  onClick={() => setCallType(type)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                    callType === type
                      ? "bg-[#063b32] text-white"
                      : "border border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32]/30"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Organisation */}
          <div className="mb-4 relative">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-2">
              Organisation (optional)
            </label>
            {selectedOrg ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#063b32]/20 bg-[#063b32]/5 px-3 py-2">
                <span className="flex-1 text-sm font-semibold text-[#063b32]">{selectedOrg.name}</span>
                <button onClick={() => setSelectedOrg(null)}>
                  <X className="h-4 w-4 text-[#6f6b62]" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
                  <input
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    placeholder="Search organisations…"
                    className="w-full rounded-lg border border-[#111111]/15 py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
                  />
                </div>
                {orgs.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-[#111111]/10 bg-white shadow-lg overflow-hidden">
                    {orgs.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => { setSelectedOrg(o); setOrgSearch(""); setOrgs([]); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f7f4ea] transition-colors border-b border-[#111111]/5 last:border-0"
                      >
                        <span className="text-sm font-semibold text-[#111111]">{o.name}</span>
                        {o.industry && <span className="text-xs text-[#6f6b62]">{o.industry}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Contact */}
          <div className="mb-6 relative">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-2">
              Contact (optional)
            </label>
            {selectedContact ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#063b32]/20 bg-[#063b32]/5 px-3 py-2">
                <span className="flex-1 text-sm font-semibold text-[#063b32]">
                  {selectedContact.first_name} {selectedContact.last_name || ""}
                </span>
                <button onClick={() => setSelectedContact(null)}>
                  <X className="h-4 w-4 text-[#6f6b62]" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
                  <input
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search contacts…"
                    className="w-full rounded-lg border border-[#111111]/15 py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
                  />
                </div>
                {contacts.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-[#111111]/10 bg-white shadow-lg overflow-hidden">
                    {contacts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedContact(c); setContactSearch(""); setContacts([]); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f7f4ea] transition-colors border-b border-[#111111]/5 last:border-0"
                      >
                        <span className="text-sm font-semibold text-[#111111]">
                          {c.first_name} {c.last_name || ""}
                        </span>
                        {c.role && <span className="text-xs text-[#6f6b62]">{c.role}</span>}
                      </button>
                    ))}
                    <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#063b32] hover:bg-[#f7f4ea] border-t border-[#111111]/5">
                      <Plus className="h-3.5 w-3.5" /> Start without selecting a contact
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={startCall}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b32] px-6 py-4 text-base font-semibold text-white hover:bg-[#1a5c42] transition-colors"
          >
            <Phone className="h-5 w-5" /> Start call
          </button>
        </div>
      )}

      {callState === "active" && (
        <div className="flex h-[calc(100vh-73px)] overflow-hidden">
          {/* Left: context */}
          <div className="w-64 shrink-0 border-r border-[#111111]/10 overflow-y-auto bg-[#f7f4ea] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Call context</p>
            {selectedOrg && (
              <div className="mb-3 rounded-lg bg-white border border-[#111111]/10 p-3">
                <p className="text-xs font-semibold text-[#111111]">{selectedOrg.name}</p>
                {selectedOrg.industry && <p className="text-xs text-[#6f6b62]">{selectedOrg.industry}</p>}
                {selectedOrg.size && selectedOrg.size !== "Unknown" && (
                  <p className="text-xs text-[#6f6b62]">{selectedOrg.size}</p>
                )}
              </div>
            )}
            {selectedContact && (
              <div className="mb-3 rounded-lg bg-white border border-[#111111]/10 p-3">
                <p className="text-xs font-semibold text-[#111111]">
                  {selectedContact.first_name} {selectedContact.last_name || ""}
                </p>
                {selectedContact.role && <p className="text-xs text-[#6f6b62]">{selectedContact.role}</p>}
              </div>
            )}
            <div className="mb-3">
              <p className="text-xs text-[#6f6b62] mb-1">Call type</p>
              <span className="rounded-full bg-[#063b32] px-2 py-0.5 text-[10px] font-semibold text-white capitalize">
                {callType}
              </span>
            </div>
            {selectedPainPoints.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-2">
                  Pain points ({selectedPainPoints.length})
                </p>
                <div className="space-y-1">
                  {selectedPainPoints.map((pp) => (
                    <button
                      key={pp.id}
                      onClick={() => loadVatPrompts(pp)}
                      className={`w-full text-left rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                        activePainPoint?.id === pp.id
                          ? "border-[#063b32] bg-[#063b32]/10 text-[#063b32]"
                          : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300"
                      }`}
                    >
                      <Zap className="inline h-3 w-3 mr-1" />
                      {pp.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Centre: notes */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Notes and pain points</p>

            {/* Pain point search */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
                  <input
                    value={painPointSearch}
                    onChange={(e) => { setPainPointSearch(e.target.value); setAiMatches([]); setAiMatchError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void runAiSearch(); }}}
                    placeholder="Describe what they said or search by keyword…"
                    className="w-full rounded-lg border border-[#111111]/15 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
                  />
                  {painPoints.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-lg border border-[#111111]/10 bg-white shadow-lg overflow-hidden">
                      {painPoints.map((pp) => (
                        <button
                          key={pp.id}
                          onClick={() => addPainPoint(pp)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[#f7f4ea] border-b border-[#111111]/5 last:border-0"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <div>
                            <p className="text-sm font-semibold text-[#111111]">{pp.title}</p>
                            <p className="text-xs text-[#6f6b62]">{pp.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => void runAiSearch()}
                  disabled={!painPointSearch.trim() || aiSearching}
                  title="AI semantic match — describe what you heard"
                  className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-40 transition-colors"
                >
                  {aiSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI match
                </button>
              </div>

              {/* AI semantic match results */}
              {aiMatchError && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  {aiMatchError}
                </div>
              )}
              {aiMatchError && painPointSearch.trim() && !aiSearching && (
                <div className="mt-2 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50">
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/admin/engagement/ai/draft-pain-point", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          phrase: painPointSearch,
                          orgContext: selectedOrg ? `${selectedOrg.name}, ${selectedOrg.industry || ""}` : undefined,
                        }),
                      });
                      const j = await res.json() as { data?: unknown };
                      if (j.data) {
                        setNotes(prev => [...prev, {
                          id: crypto.randomUUID(),
                          text: `Draft pain point created for review: "${painPointSearch}"`,
                          timestamp: new Date(),
                          type: "note",
                        }]);
                        setAiMatches([]);
                      }
                    }}
                    className="text-xs text-violet-700 hover:underline"
                  >
                    None match? Create a draft pain point for review →
                  </button>
                </div>
              )}
              {aiMatches.length > 0 && (
                <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-violet-200">
                    <Bot className="h-3.5 w-3.5 text-violet-600" />
                    <p className="text-xs font-semibold text-violet-700">AI semantic matches — review before adding</p>
                    <button onClick={() => setAiMatches([])} className="ml-auto text-violet-500 hover:text-violet-700">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {aiMatches.map((match) => (
                    <div key={match.id} className="px-3 py-2.5 border-b border-violet-200/60 last:border-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#111111]">
                              {match.pain_point?.title || match.id}
                            </p>
                            <span className="text-[10px] font-semibold text-violet-600 bg-violet-100 rounded-full px-1.5 py-0.5">
                              {match.score}%
                            </span>
                          </div>
                          <p className="text-xs text-[#6f6b62] mt-0.5">{match.why}</p>
                          {match.discovery_question && (
                            <p className="mt-1 text-xs text-[#111111] italic">
                              &ldquo;{match.discovery_question}&rdquo;
                            </p>
                          )}
                        </div>
                        {match.pain_point && (
                          <button
                            onClick={() => { addPainPoint(match.pain_point!); setAiMatches(prev => prev.filter(m => m.id !== match.id)); }}
                            className="shrink-0 rounded-md bg-[#063b32] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {painPointSearch.trim() && (
                    <div className="px-3 py-2 border-t border-violet-200">
                      <button
                        onClick={async () => {
                          const res = await fetch("/api/admin/engagement/ai/draft-pain-point", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              phrase: painPointSearch,
                              orgContext: selectedOrg ? `${selectedOrg.name}, ${selectedOrg.industry || ""}` : undefined,
                            }),
                          });
                          const j = await res.json() as { data?: unknown };
                          if (j.data) {
                            setNotes(prev => [...prev, {
                              id: crypto.randomUUID(),
                              text: `Draft pain point created for review: "${painPointSearch}"`,
                              timestamp: new Date(),
                              type: "note",
                            }]);
                            setAiMatches([]);
                          }
                        }}
                        className="text-xs text-violet-700 hover:underline"
                      >
                        None match? Create a draft pain point for review →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Note type selector */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {(["note", "commitment", "question"] as CallNote["type"][]).map((type) => (
                <button
                  key={type}
                  onClick={() => setNoteType(type)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    noteType === type
                      ? type === "commitment"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : type === "question"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-[#063b32] text-white border-[#063b32]"
                      : noteTypeColor[type]
                  }`}
                >
                  {noteTypeLabel[type]}
                </button>
              ))}
            </div>

            {/* Note input */}
            <div className="mb-4">
              <textarea
                ref={noteRef}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(noteType); }}}
                placeholder="Type a note… (Enter to save)"
                rows={3}
                className={`w-full rounded-lg border p-3 text-sm outline-none resize-none transition-colors ${
                  noteType === "commitment"
                    ? "border-emerald-200 focus:border-emerald-400 bg-emerald-50/40"
                    : noteType === "question"
                    ? "border-blue-200 focus:border-blue-400 bg-blue-50/40"
                    : "border-[#111111]/15 focus:border-[#063b32] bg-white"
                }`}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => addNote(noteType)}
                  disabled={!noteText.trim()}
                  className="rounded-md bg-[#063b32] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-40"
                >
                  Add {noteTypeLabel[noteType].toLowerCase()}
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className={`rounded-lg border p-3 ${noteTypeColor[note.type]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[#111111] flex-1">{note.text}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                        {noteTypeLabel[note.type]}
                      </span>
                      <span className="text-[10px] text-[#6f6b62]">
                        {note.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <button onClick={() => setNotes((n) => n.filter((x) => x.id !== note.id))}>
                        <X className="h-3.5 w-3.5 text-[#6f6b62] hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-[#6f6b62] text-center py-8">
                  Notes will appear here. Use the search above to add pain points.
                </p>
              )}
            </div>
          </div>

          {/* Right: guidance */}
          <div className="w-72 shrink-0 border-l border-[#111111]/10 overflow-y-auto p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Guidance</p>
            {activePainPoint ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-[#f5f274]/20 border border-[#f5f274] p-3">
                  <p className="text-xs font-semibold text-[#111111] mb-1">{activePainPoint.title}</p>
                  {activePainPoint.natural_questions?.[0] && (
                    <div className="mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">
                        Natural next question
                      </p>
                      <p className="text-sm text-[#111111]">&ldquo;{activePainPoint.natural_questions[0]}&rdquo;</p>
                    </div>
                  )}
                  {activePainPoint.what_not_assume?.[0] && (
                    <div className="mt-2 flex items-start gap-2 rounded bg-amber-50 border border-amber-200 p-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <p className="text-xs text-amber-700">{activePainPoint.what_not_assume[0]}</p>
                    </div>
                  )}
                </div>

                {vatPrompts.slice(0, 3).map((v) => (
                  <div key={v.id} className={`rounded-lg border p-3 text-xs ${
                    v.dimension === "value" ? "border-emerald-200 bg-emerald-50" :
                    v.dimension === "alignment" ? "border-blue-200 bg-blue-50" :
                    "border-amber-200 bg-amber-50"
                  }`}>
                    <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      v.dimension === "value" ? "text-emerald-700" :
                      v.dimension === "alignment" ? "text-blue-700" : "text-amber-700"
                    }`}>
                      VAT — {v.dimension}
                    </p>
                    <p className={
                      v.dimension === "value" ? "text-emerald-800" :
                      v.dimension === "alignment" ? "text-blue-800" : "text-amber-800"
                    }>
                      {v.prompt}
                    </p>
                  </div>
                ))}

                {activePainPoint.recommendation_pathways?.[0] && (
                  <div className="rounded-lg border border-[#111111]/10 bg-white p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">
                      Possible next step
                    </p>
                    <p className="text-xs text-[#111111]">{activePainPoint.recommendation_pathways[0]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-8 w-8 text-[#6f6b62]/30 mb-2" />
                <p className="text-xs text-[#6f6b62]">
                  Search and add a pain point to see guidance here
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-call summary */}
      {callState === "post" && showSummary && (
        <div className="px-8 py-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111111]">Call ended — review before saving</h2>
              <p className="text-sm text-[#6f6b62]">Nothing is saved as a confirmed fact until you approve it.</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-3">Summary</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Contact</p>
                  <p className="mt-0.5 text-[#111111]">
                    {selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name || ""}` : "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Organisation</p>
                  <p className="mt-0.5 text-[#111111]">{selectedOrg?.name || "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Call type</p>
                  <p className="mt-0.5 text-[#111111] capitalize">{callType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Duration</p>
                  <p className="mt-0.5 text-[#111111]">{elapsed}</p>
                </div>
              </div>
            </div>

            {selectedPainPoints.length > 0 && (
              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-3">
                  Confirmed pain points ({selectedPainPoints.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPainPoints.map((pp) => (
                    <span key={pp.id} className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <Zap className="h-3 w-3" /> {pp.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {notes.length > 0 && (
              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-3">
                  Notes ({notes.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notes.map((n) => (
                    <div key={n.id} className={`rounded-lg border p-2.5 text-xs ${noteTypeColor[n.type]}`}>
                      <span className="font-semibold text-[#6f6b62] uppercase tracking-[0.08em] mr-2">
                        {noteTypeLabel[n.type]}
                      </span>
                      {n.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI note structuring */}
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 shrink-0 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-violet-800">Help me structure these notes</p>
                    <p className="mt-0.5 text-xs text-violet-700">
                      AI will suggest a structured summary for review. Your original notes are always kept.
                    </p>
                  </div>
                </div>
                {!structuredNotes && (
                  <button
                    onClick={() => void structureNotes()}
                    disabled={structuring || notes.length === 0}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
                  >
                    {structuring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {structuring ? "Structuring…" : "Structure notes"}
                  </button>
                )}
              </div>

              {structuredNotes && (
                <div className="mt-4 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-600">
                    AI-suggested structure — review and deselect anything inaccurate
                  </p>
                  {[
                    { key: "call_summary", label: "Call summary", value: structuredNotes.call_summary },
                    { key: "confirmed_pain_points", label: "Confirmed pain points", value: structuredNotes.confirmed_pain_points },
                    { key: "possible_pain_points", label: "Possible pain points (unconfirmed)", value: structuredNotes.possible_pain_points?.map((p: { topic: string; note: string }) => `${p.topic}: ${p.note}`) },
                    { key: "agreed_next_steps", label: "Agreed next steps", value: structuredNotes.agreed_next_steps },
                    { key: "desired_outcomes", label: "Desired outcomes", value: structuredNotes.desired_outcomes },
                    { key: "follow_up_tasks", label: "Follow-up tasks", value: structuredNotes.follow_up_tasks },
                    { key: "possible_vaxai_support", label: "Possible VAxAI support (to explore)", value: structuredNotes.possible_vaxai_support },
                    { key: "trust_concerns", label: "Trust / AI concerns raised", value: structuredNotes.trust_concerns },
                  ].filter(s => Array.isArray(s.value) ? (s.value as unknown[]).length > 0 : !!s.value).map(section => (
                    <div key={section.key} className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={structuredApproved.has(section.key)}
                        onChange={e => {
                          setStructuredApproved(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(section.key); else next.delete(section.key);
                            return next;
                          });
                        }}
                        className="mt-0.5 h-3.5 w-3.5 accent-violet-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-700">{section.label}</p>
                        {Array.isArray(section.value) ? (
                          <ul className="mt-0.5 space-y-0.5">
                            {(section.value as string[]).map((v, i) => (
                              <li key={i} className="text-xs text-[#111111]">· {v}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-0.5 text-xs text-[#111111]">{section.value as string}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI follow-up draft */}
            {structuredNotes && (
              <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <FileEdit className="h-5 w-5 shrink-0 text-[#063b32] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#063b32]">Draft a follow-up</p>
                      <p className="mt-0.5 text-xs text-[#6f6b62]">AI will draft a follow-up email based on this call. Edit before sending.</p>
                    </div>
                  </div>
                  {!followUpDraft && (
                    <button
                      onClick={() => void generateFollowUp()}
                      disabled={draftingFollowUp}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-40"
                    >
                      {draftingFollowUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      {draftingFollowUp ? "Drafting…" : "Draft follow-up"}
                    </button>
                  )}
                </div>
                {followUpDraft && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Draft — edit before sending</p>
                      <button
                        onClick={() => {
                          void navigator.clipboard.writeText(followUpDraft.draft);
                          setFollowUpCopied(true);
                          setTimeout(() => setFollowUpCopied(false), 2000);
                        }}
                        className="flex items-center gap-1 text-xs text-[#063b32] hover:underline"
                      >
                        <Copy className="h-3 w-3" />
                        {followUpCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    {followUpDraft.suggested_subject && (
                      <p className="text-xs text-[#6f6b62]">
                        <span className="font-semibold">Subject:</span> {followUpDraft.suggested_subject}
                      </p>
                    )}
                    <textarea
                      value={followUpDraft.draft}
                      onChange={e => setFollowUpDraft(prev => prev ? { ...prev, draft: e.target.value } : null)}
                      rows={8}
                      className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#063b32] resize-none"
                    />
                    <p className="text-[10px] text-[#6f6b62]">
                      This is a draft only. Review carefully and do not send automatically. Copy and paste into your email client.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Review before saving</p>
                  <p className="mt-1 text-xs text-amber-700">
                    Please review the notes above. Once saved, this will create an interaction record. AI-generated summaries are labelled as such.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="approve"
              checked={summaryApproved}
              onChange={(e) => setSummaryApproved(e.target.checked)}
              className="h-4 w-4 rounded border-[#111111]/20 accent-[#063b32]"
            />
            <label htmlFor="approve" className="text-sm font-semibold text-[#111111]">
              I have reviewed the notes and they are accurate
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveCallRecord}
              disabled={!summaryApproved || saving}
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save interaction record"}
            </button>
            <button
              onClick={() => router.push("/admin/engagement")}
              className="rounded-lg border border-[#111111]/15 px-5 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              Discard and go to overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveCallAssist() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LiveCallAssistInner />
    </Suspense>
  );
}
