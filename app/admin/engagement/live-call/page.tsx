"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  FileEdit,
  Inbox,
  Link2,
  Loader2,
  MessageSquare,
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
import { CallAssistChat } from "@/components/admin/CallAssistChat";
import { CallPrepContextPicker } from "@/components/admin/CallPrepContextPicker";
import type { CallAssistChatMessage, CustomCard, ProspectCallContext } from "@/lib/engagement/call-context";
import {
  buildEnquiryCallContext,
  buildOpportunityCallContext,
  buildQueueCallContext,
  clearPersistedCallContext,
  persistCallContext,
} from "@/lib/engagement/live-call-link";
import type { EngagementContact, EngagementOrganisation, PainPoint, Persona, SectorProfile, VatPrompt } from "@/lib/engagement/types";
import type { ProspectPrepClient } from "@/lib/engagement/prospect-prep";
import { CallRecordsContent } from "./call-records-content";

type PageTab = "live_call" | "call_records";
type LinkSourceTab = "enquiry" | "queue" | "opportunity";
type LinkSearchResult = { id: string; label: string; sublabel: string; source: LinkSourceTab };

type CallNote = { id: string; text: string; timestamp: Date; type: "note" | "pain_point" | "commitment" | "question" };
type CallState = "pre" | "active" | "post";
type AiMatch = { id: string; score: number; why: string; discovery_question: string; suggested_wording: string; pain_point?: PainPoint };
type QuickGuidance = {
  title: string;
  what_this_means: string[];
  natural_questions: string[];
  what_not_assume: string[];
  possible_support: string[];
};
type LiveDraft = { id: string; phrase: string; guidance: QuickGuidance; kept: boolean };
type StructuredNotes = {
  call_summary: string;
  captured_notes?: string[];
  client_commitments?: string[];
  open_questions?: string[];
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

type QueuePrepCard = {
  id: string;
  what_we_know: string[];
  to_confirm: string[];
  previous_engagement_summary: string;
  sector_considerations: string[];
  pain_points_to_explore: Array<{ title: string; why: string; caution: string }>;
  discovery_questions: string[];
  suggested_opening: string;
  key_cautions: string[];
};

type QueueCustomCard = { id: string; title: string; content: string };

// ProspectCallContext imported from lib/engagement/call-context

function ProspectContextSections({
  context,
  loadedPreps,
  expanded,
  onToggle,
  compact = false,
}: {
  context: ProspectCallContext | null;
  loadedPreps: ProspectPrepClient[];
  expanded: Record<string, boolean>;
  onToggle: (key: string) => void;
  compact?: boolean;
}) {
  if (!context && loadedPreps.length === 0) return null;

  const textSize = compact ? "text-[10px]" : "text-xs";
  const pad = compact ? "p-2" : "p-3";

  const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
    <div className="rounded-lg border border-[#111111]/10 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className={`flex w-full items-center justify-between ${pad} text-left`}
      >
        <span className={`font-semibold text-[#111111] ${compact ? "text-[10px]" : "text-xs"}`}>{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#6f6b62] transition-transform ${expanded[id] ? "rotate-180" : ""}`} />
      </button>
      {expanded[id] && <div className={`border-t border-[#111111]/10 ${pad} ${textSize} text-[#6f6b62] space-y-1.5`}>{children}</div>}
    </div>
  );

  return (
    <div className="space-y-2">
      {context && (
        <Section id="prospect" title={context.orgName}>
          {context.contactName && <p><span className="font-medium text-[#111111]">Contact:</span> {context.contactName}</p>}
          {context.email && <p><span className="font-medium text-[#111111]">Email:</span> {context.email}</p>}
          {context.phone && <p><span className="font-medium text-[#111111]">Phone:</span> {context.phone}</p>}
          {context.industry && <p><span className="font-medium text-[#111111]">Industry:</span> {context.industry}</p>}
          {context.location && <p><span className="font-medium text-[#111111]">Location:</span> {context.location}</p>}
          {context.nextAction && (
            <p>
              <span className="font-medium text-[#111111]">Next action:</span> {context.nextAction}
              {context.nextActionDate && ` · ${new Date(context.nextActionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            </p>
          )}
          {context.notes && <p className="whitespace-pre-wrap italic">{context.notes}</p>}
        </Section>
      )}
      {context?.aiPrepCards.map((card, idx) => (
        <Section key={card.id} id={card.id} title={`AI preparation ${idx + 1}`}>
          {card.suggested_opening && <p className="italic text-[#111111]">&ldquo;{card.suggested_opening}&rdquo;</p>}
          {card.what_we_know?.length > 0 && (
            <div>
              <p className="font-medium text-emerald-700">Confirmed</p>
              <ul className="list-disc pl-4">{card.what_we_know.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          )}
          {card.discovery_questions?.length > 0 && (
            <div>
              <p className="font-medium text-violet-700">Discovery questions</p>
              <ul className="space-y-0.5">{card.discovery_questions.map((q, i) => <li key={i}>· {q}</li>)}</ul>
            </div>
          )}
          {card.key_cautions?.length > 0 && (
            <div>
              <p className="font-medium text-red-600">Cautions</p>
              <ul className="list-disc pl-4">{card.key_cautions.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
        </Section>
      ))}
      {loadedPreps.map((prep) => (
        <Section key={prep.id} id={`prep-${prep.id}`} title={prep.name || "Prospect prep"}>
          {prep.clientType && <p>{prep.clientType}</p>}
          {prep.sector && <p><span className="font-medium text-[#111111]">Sector:</span> {prep.sector.name}</p>}
          {prep.persona && <p><span className="font-medium text-[#111111]">Persona:</span> {prep.persona.persona_name}</p>}
          {prep.relevantPains?.length > 0 && (
            <ul className="list-disc pl-4 space-y-0.5">
              {prep.relevantPains.map((pp, i) => <li key={i} className="text-[#111111]">{pp.title}</li>)}
            </ul>
          )}
          {prep.prepNotes && <p className="italic">{prep.prepNotes}</p>}
        </Section>
      ))}
      {context?.customCards.map((card) => (
        <Section key={card.id} id={card.id} title={card.title}>
          <p className="whitespace-pre-wrap text-[#111111]">{card.content}</p>
        </Section>
      ))}
    </div>
  );
}

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
  const [structureError, setStructureError] = useState<string | null>(null);
  const [structuredNotes, setStructuredNotes] = useState<StructuredNotes | null>(null);
  const [structuredApproved, setStructuredApproved] = useState<Set<string>>(new Set());
  const [rawNotesSnapshot, setRawNotesSnapshot] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [draftingFollowUp, setDraftingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [followUpDraft, setFollowUpDraft] = useState<{ draft: string; suggested_subject: string } | null>(null);
  const [followUpCopied, setFollowUpCopied] = useState(false);
  const [liveDrafts, setLiveDrafts] = useState<LiveDraft[]>([]);
  const [activeLiveDraft, setActiveLiveDraft] = useState<LiveDraft | null>(null);
  const [generatingGuidance, setGeneratingGuidance] = useState(false);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);
  const [loadedPreps, setLoadedPreps] = useState<ProspectPrepClient[]>([]);
  const [queueContext, setQueueContext] = useState<ProspectCallContext | null>(null);
  const [expandedContext, setExpandedContext] = useState<Record<string, boolean>>({ prospect: true });
  const [showPrepPicker, setShowPrepPicker] = useState(false);
  const [prepPickerList, setPrepPickerList] = useState<ProspectPrepClient[]>([]);
  const [prepPickerLoading, setPrepPickerLoading] = useState(false);
  const [pageTab, setPageTab] = useState<PageTab>("live_call");
  const [linkSourceTab, setLinkSourceTab] = useState<LinkSourceTab>("enquiry");
  const [linkSearch, setLinkSearch] = useState("");
  const [linkResults, setLinkResults] = useState<LinkSearchResult[]>([]);
  const [linkSearching, setLinkSearching] = useState(false);
  const [linkLoadingId, setLinkLoadingId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<CallAssistChatMessage[]>([]);
  const [callSessionKey, setCallSessionKey] = useState(0);
  const [prepSector, setPrepSector] = useState<SectorProfile | null>(null);
  const [prepPersona, setPrepPersona] = useState<Persona | null>(null);
  const [prepPainPoints, setPrepPainPoints] = useState<PainPoint[]>([]);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const getSessionCallContext = useCallback((): ProspectCallContext | null => {
    if (!queueContext) return null;
    const painCards: CustomCard[] = prepPainPoints.length > 0
      ? [{
          id: "prep-pain-points",
          title: "Pain points to explore",
          content: prepPainPoints.map((p) => `• ${p.title}`).join("\n"),
        }]
      : [];
    return {
      ...queueContext,
      sector: prepSector || queueContext.sector,
      persona: prepPersona || queueContext.persona,
      customCards: [...(queueContext.customCards || []), ...painCards],
      prospectPreps: loadedPreps,
    };
  }, [queueContext, prepSector, prepPersona, prepPainPoints, loadedPreps]);

  const formatChatTranscript = useCallback((msgs: CallAssistChatMessage[]) => {
    return msgs
      .filter((m) => m.id !== "welcome")
      .map((m) => {
        const who = m.role === "user" ? "You" : "Assistant";
        const time = m.timestamp instanceof Date
          ? m.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : "";
        return `[${time}] ${who}: ${m.content}`;
      })
      .join("\n\n");
  }, []);

  const toggleContextSection = (key: string) => {
    setExpandedContext((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generateQuickGuidance = useCallback(async (phrase: string) => {
    setGeneratingGuidance(true);
    setActiveLiveDraft(null);
    setGuidanceError(null);
    try {
      const res = await fetch("/api/admin/engagement/ai/quick-pain-point-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase,
          orgContext: selectedOrg ? `${selectedOrg.name}, ${selectedOrg.industry || ""}` : undefined,
          callType,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        setGuidanceError(err.error || `API error ${res.status} — check server logs`);
        return;
      }
      const j = await res.json() as { data?: QuickGuidance };
      if (j.data && j.data.title) {
        const draft: LiveDraft = { id: crypto.randomUUID(), phrase, guidance: j.data, kept: false };
        setLiveDrafts(prev => prev.some(d => d.phrase === phrase) ? prev : [...prev, draft]);
        setActiveLiveDraft(draft);
      } else {
        setGuidanceError("No guidance returned — ANTHROPIC_API_KEY may not be set in the server environment");
      }
    } catch (e) {
      console.error("Quick guidance failed", e);
      setGuidanceError("Network error connecting to guidance API");
    } finally {
      setGeneratingGuidance(false);
    }
  }, [selectedOrg, callType]);

  const initialPainPointId = searchParams.get("pain_point");
  const initialOrgId = searchParams.get("org");
  const initialContactId = searchParams.get("contact");
  const initialEnquiryId = searchParams.get("enquiry");
  const initialQueueId = searchParams.get("queue");
  const initialOpportunityId = searchParams.get("opportunity") || searchParams.get("opp");

  const applyLinkedContext = useCallback(async (ctx: ProspectCallContext) => {
    setQueueContext(ctx);
    persistCallContext(ctx);
    const expanded: Record<string, boolean> = { prospect: true };
    ctx.customCards?.forEach((c) => { expanded[c.id] = true; });
    ctx.prospectPreps?.forEach((p) => { expanded[`prep-${p.id}`] = true; });
    setExpandedContext(expanded);
    if (ctx.prospectPreps?.length) setLoadedPreps(ctx.prospectPreps);

    if (ctx.organisationId) {
      const orgRes = await fetch(`/api/admin/engagement/organisations/${ctx.organisationId}`);
      const orgJson = await orgRes.json() as { data?: EngagementOrganisation };
      if (orgJson.data) setSelectedOrg(orgJson.data);
      else setSelectedOrg(null);
    } else {
      setSelectedOrg(null);
    }

    if (ctx.contactId) {
      const contactRes = await fetch(`/api/admin/engagement/contacts/${ctx.contactId}`);
      const contactJson = await contactRes.json() as { data?: EngagementContact };
      if (contactJson.data) setSelectedContact(contactJson.data);
      else setSelectedContact(null);
    } else {
      setSelectedContact(null);
    }
  }, []);

  const clearLink = useCallback(() => {
    setQueueContext(null);
    clearPersistedCallContext();
    setSelectedOrg(null);
    setSelectedContact(null);
    setLoadedPreps([]);
    setPrepSector(null);
    setPrepPersona(null);
    setPrepPainPoints([]);
    setLinkSearch("");
    setLinkResults([]);
  }, []);

  const linkRecord = useCallback(async (source: LinkSourceTab, id: string) => {
    setLinkLoadingId(id);
    try {
      let ctx: ProspectCallContext | null = null;
      if (source === "enquiry") {
        const res = await fetch(`/api/admin/enquiries/${id}`);
        const j = await res.json() as { data?: Parameters<typeof buildEnquiryCallContext>[0] };
        if (j.data) ctx = buildEnquiryCallContext(j.data, initialOpportunityId);
      } else if (source === "queue") {
        const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`);
        const j = await res.json() as { data?: Parameters<typeof buildQueueCallContext>[0] };
        if (j.data) ctx = buildQueueCallContext(j.data, initialOpportunityId);
      } else {
        const res = await fetch(`/api/admin/engagement/opportunities/${id}`);
        const j = await res.json() as { data?: Parameters<typeof buildOpportunityCallContext>[0] };
        if (j.data) ctx = buildOpportunityCallContext(j.data);
      }
      if (ctx) await applyLinkedContext(ctx);
    } finally {
      setLinkLoadingId(null);
    }
  }, [applyLinkedContext, initialOpportunityId]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "call_records") setPageTab("call_records");
  }, [searchParams]);

  useEffect(() => {
    if (initialPainPointId) {
      fetch(`/api/admin/engagement/pain-points/${initialPainPointId}`)
        .then((r) => r.json())
        .then((j: { data: PainPoint }) => {
          if (j.data) setSelectedPainPoints([j.data]);
        });
    }
  }, [initialPainPointId]);

  useEffect(() => {
    const ctxRaw = sessionStorage.getItem("prospectCallContext");
    if (ctxRaw) {
      try {
        const raw = JSON.parse(ctxRaw) as ProspectCallContext & { sourceType?: string; sourceId?: string };
        const ctx: ProspectCallContext = {
          ...raw,
          sourceType: raw.sourceType || "queue",
          sourceId: raw.sourceId || raw.queueId || "unknown",
          aiPrepCards: raw.aiPrepCards || [],
          prospectPreps: raw.prospectPreps || [],
          customCards: raw.customCards || [],
        };
        void applyLinkedContext(ctx);
      } catch { /* ignore */ }
    }
    const prepsRaw = sessionStorage.getItem("currentProspectPreps") || sessionStorage.getItem("currentProspectPrep") || localStorage.getItem("currentProspectPrep");
    if (prepsRaw) {
      try {
        const parsed = JSON.parse(prepsRaw);
        const preps = Array.isArray(parsed) ? parsed : [parsed];
        setLoadedPreps((prev) => {
          const merged = [...prev];
          preps.forEach((p: ProspectPrepClient) => {
            if (!merged.some((x) => x.id === p.id)) merged.push(p);
          });
          return merged;
        });
        localStorage.removeItem("currentProspectPrep");
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!initialOrgId) return;
    fetch(`/api/admin/engagement/organisations/${initialOrgId}`)
      .then((r) => r.json())
      .then((j: { data?: EngagementOrganisation }) => {
        if (j.data) setSelectedOrg(j.data);
      })
      .catch(() => undefined);
  }, [initialOrgId]);

  useEffect(() => {
    if (!initialContactId) return;
    fetch(`/api/admin/engagement/contacts/${initialContactId}`)
      .then((r) => r.json())
      .then((j: { data?: EngagementContact }) => {
        if (j.data) setSelectedContact(j.data);
      })
      .catch(() => undefined);
  }, [initialContactId]);

  useEffect(() => {
    if (!initialEnquiryId || queueContext) return;
    void linkRecord("enquiry", initialEnquiryId);
  }, [initialEnquiryId, queueContext, linkRecord]);

  useEffect(() => {
    if (!initialQueueId || queueContext) return;
    void linkRecord("queue", initialQueueId);
  }, [initialQueueId, queueContext, linkRecord]);

  useEffect(() => {
    if (!initialOpportunityId || queueContext) return;
    void linkRecord("opportunity", initialOpportunityId);
  }, [initialOpportunityId, queueContext, linkRecord]);

  useEffect(() => {
    if (!linkSearch.trim() || queueContext) {
      setLinkResults([]);
      return;
    }
    const q = linkSearch.trim().toLowerCase();
    const timer = setTimeout(() => {
      void (async () => {
        setLinkSearching(true);
        try {
          if (linkSourceTab === "enquiry") {
            const res = await fetch("/api/admin/enquiries?status=all");
            const j = await res.json() as { data?: Array<{ id: string; name: string; email: string; support_type: string }> };
            setLinkResults(
              (j.data || [])
                .filter((e) =>
                  e.name.toLowerCase().includes(q) ||
                  e.email.toLowerCase().includes(q) ||
                  e.support_type.toLowerCase().includes(q),
                )
                .slice(0, 8)
                .map((e) => ({
                  id: e.id,
                  label: e.name,
                  sublabel: `${e.email} · ${e.support_type}`,
                  source: "enquiry" as const,
                })),
            );
          } else if (linkSourceTab === "queue") {
            const res = await fetch("/api/admin/engagement/prospect-queue?limit=200");
            const j = await res.json() as { data?: Array<{
              id: string;
              raw_org_name: string | null;
              raw_contact_name: string | null;
              raw_email: string | null;
              status: string;
              organisation?: { name: string } | null;
            }> };
            setLinkResults(
              (j.data || [])
                .filter((e) => {
                  const org = (e.organisation?.name || e.raw_org_name || "").toLowerCase();
                  const contact = (e.raw_contact_name || "").toLowerCase();
                  const email = (e.raw_email || "").toLowerCase();
                  return org.includes(q) || contact.includes(q) || email.includes(q);
                })
                .slice(0, 8)
                .map((e) => ({
                  id: e.id,
                  label: e.organisation?.name || e.raw_org_name || e.raw_contact_name || "Prospect",
                  sublabel: [e.raw_contact_name, e.raw_email, e.status].filter(Boolean).join(" · "),
                  source: "queue" as const,
                })),
            );
          } else {
            const res = await fetch(`/api/admin/engagement/opportunities?q=${encodeURIComponent(linkSearch.trim())}&limit=10`);
            const j = await res.json() as { data?: Array<{
              id: string;
              title: string;
              stage: string;
              organisation?: { name: string } | null;
            }> };
            setLinkResults(
              (j.data || []).map((o) => ({
                id: o.id,
                label: o.title,
                sublabel: `${o.organisation?.name || "No org"} · ${o.stage}`,
                source: "opportunity" as const,
              })),
            );
          }
        } finally {
          setLinkSearching(false);
        }
      })();
    }, 300);
    return () => clearTimeout(timer);
  }, [linkSearch, linkSourceTab, queueContext]);

  const loadPrepPicker = async () => {
    setPrepPickerLoading(true);
    try {
      const res = await fetch("/api/admin/engagement/prospect-preps?limit=50");
      const json = await res.json() as { data?: ProspectPrepClient[] };
      setPrepPickerList(json.data || []);
      setShowPrepPicker(true);
    } catch {
      alert("Could not load prospect preps. Check that the Supabase migration has been run.");
    } finally {
      setPrepPickerLoading(false);
    }
  };

  const selectPrepFromPicker = (prep: ProspectPrepClient) => {
    setLoadedPreps((prev) => {
      if (prev.some((p) => p.id === prep.id)) return prev;
      const next = [...prev, prep];
      sessionStorage.setItem("currentProspectPreps", JSON.stringify(next));
      return next;
    });
    setExpandedContext((prev) => ({ ...prev, [`prep-${prep.id}`]: true }));
    setShowPrepPicker(false);
  };

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

  // Search pain points (keyword)
  useEffect(() => {
    if (!painPointSearch.trim()) { setPainPoints([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/engagement/pain-points?q=${encodeURIComponent(painPointSearch)}&limit=8`);
      const j = await res.json() as { data: PainPoint[] };
      setPainPoints(j.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [painPointSearch]);

  // Auto-fire quick guidance as the user types (debounced). Only while call active + meaningful input.
  // This powers the live guidance panel in parallel with keyword search.
  useEffect(() => {
    if (callState !== "active") return;
    const trimmed = painPointSearch.trim();
    if (trimmed.length < 8) return;
    const t = setTimeout(() => {
      void generateQuickGuidance(trimmed);
    }, 1200);
    return () => clearTimeout(t);
  }, [painPointSearch, callState, generateQuickGuidance]);


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

  const addNoteFromText = (text: string, type: CallNote["type"] = "note") => {
    if (!text.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: text.trim(), timestamp: new Date(), type },
    ]);
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

    // Fire quick guidance IMMEDIATELY in parallel — don't wait for pain-point-search.
    // It manages its own state (generatingGuidance, activeLiveDraft) independently.
    void generateQuickGuidance(painPointSearch);

    try {
      // Fetch a limited set — 20 is plenty for AI matching and faster to process
      const res = await fetch(`/api/admin/engagement/pain-points?limit=20`);
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
        }),
      });
      if (!searchRes.ok) {
        const errText = await searchRes.text();
        console.error("AI match API error", errText);
        setAiMatchError("Knowledge base search failed");
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
        setAiMatchError("No match in knowledge base — see guidance panel →");
      }
    } catch (e) {
      console.error("AI match failed", e);
      setAiMatchError("AI match failed.");
      setAiMatches([]);
    } finally {
      setAiSearching(false);
    }
  };

  const structureNotes = async () => {
    const conversation = chatMessages.filter((m) => m.id !== "welcome");
    if (!conversation.length) return;
    setStructuring(true);
    setStructureError(null);
    try {
      setRawNotesSnapshot(formatChatTranscript(chatMessages));
      const res = await fetch("/api/admin/engagement/ai/structure-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatMessages: conversation.map((m) => ({ role: m.role, content: m.content })),
          callContext: {
            contactName: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name || ""}` : queueContext?.contactName || undefined,
            orgName: selectedOrg?.name || queueContext?.orgName,
            callType,
            duration: elapsed,
          },
        }),
      });
      const j = await res.json() as { data?: StructuredNotes; error?: string };
      if (j.data) {
        setStructuredNotes(j.data);
        setStructuredApproved(new Set(Object.keys(j.data)));
      } else {
        setStructureError(j.error || "AI structuring failed — please try again.");
      }
    } catch {
      setStructureError("AI structuring failed — check your connection and try again.");
    } finally {
      setStructuring(false);
    }
  };

  const generateFollowUp = async () => {
    setDraftingFollowUp(true);
    setFollowUpError(null);
    try {
      const summary = structuredNotes?.call_summary ||
        editedSummary ||
        formatChatTranscript(chatMessages);
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
      const j = await res.json() as { data?: { draft: string; suggested_subject: string }; error?: string };
      if (j.data) {
        setFollowUpDraft(j.data);
      } else {
        setFollowUpError(j.error || "Failed to generate follow-up — please try again.");
      }
    } catch {
      setFollowUpError("Failed to generate follow-up — check your connection and try again.");
    } finally {
      setDraftingFollowUp(false);
    }
  };

  const startCall = () => {
    const ctx = getSessionCallContext();
    if (!ctx) return;
    setQueueContext(ctx);
    persistCallContext(ctx);
    setChatMessages([]);
    setCallSessionKey((k) => k + 1);
    setStructuredNotes(null);
    setShowSummary(false);
    setSummaryApproved(false);
    setPageTab("live_call");
    setCallState("active");
    setCallStartTime(new Date());
  };

  const endCall = () => {
    setCallState("post");
    setShowSummary(true);
  };

  const saveCallRecord = async () => {
    if (!summaryApproved) return;
    setSaving(true);
    try {
      const fullNotes = formatChatTranscript(chatMessages);
      const painIds = [
        ...prepPainPoints.map((p) => p.id),
        ...(structuredNotes?.confirmed_pain_points?.length ? [] : []),
      ];
      const finalSummary = editedSummary ||
        structuredNotes?.call_summary ||
        `Call with ${queueContext?.contactName || "contact"} at ${queueContext?.orgName || "organisation"} (${callType}). Duration: ${elapsed}.`;

      const aiData = structuredNotes ? {
        call_summary: finalSummary,
        captured_notes: structuredApproved.has("captured_notes") ? structuredNotes.captured_notes : [],
        client_commitments: structuredApproved.has("client_commitments") ? structuredNotes.client_commitments : [],
        open_questions: structuredApproved.has("open_questions") ? structuredNotes.open_questions : [],
        chat_transcript: chatMessages.filter((m) => m.id !== "welcome").map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
        confirmed_pain_points: structuredApproved.has("confirmed_pain_points") ? structuredNotes.confirmed_pain_points : [],
        possible_pain_points: structuredApproved.has("possible_pain_points") ? structuredNotes.possible_pain_points : [],
        agreed_next_steps: structuredApproved.has("agreed_next_steps") ? structuredNotes.agreed_next_steps : [],
        desired_outcomes: structuredApproved.has("desired_outcomes") ? structuredNotes.desired_outcomes : [],
        follow_up_tasks: structuredApproved.has("follow_up_tasks") ? structuredNotes.follow_up_tasks : [],
        possible_vaxai_support: structuredApproved.has("possible_vaxai_support") ? structuredNotes.possible_vaxai_support : [],
        trust_concerns: structuredApproved.has("trust_concerns") ? structuredNotes.trust_concerns : [],
        follow_up_draft: followUpDraft?.draft || null,
      } : { chat_transcript: chatMessages.filter((m) => m.id !== "welcome").map((m) => ({ role: m.role, content: m.content })) };

      const res = await fetch("/api/admin/engagement/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisation_id: selectedOrg?.id || queueContext?.organisationId || null,
          contact_id: selectedContact?.id || queueContext?.contactId || null,
          opportunity_id: queueContext?.opportunityId || initialOpportunityId || null,
          enquiry_id: queueContext?.enquiryId || initialEnquiryId || null,
          interaction_date: callStartTime?.toISOString() || new Date().toISOString(),
          interaction_type: callType,
          channel: "phone",
          direction: "outbound",
          summary: finalSummary,
          full_notes: fullNotes,
          pain_point_ids: painIds,
          commitments: structuredNotes?.client_commitments?.join("; ") || structuredNotes?.agreed_next_steps?.join("; ") || null,
          outcome: "completed",
          ...(aiData ? { ai_structured_data: aiData } : {}),
        }),
      });
      const saved = await res.json() as { data?: { id: string } };

      if (queueContext?.enquiryId) {
        await fetch(`/api/admin/enquiries/${queueContext.enquiryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Contact attempted",
            last_action: `Call completed (${elapsed})`,
            last_action_date: new Date().toISOString(),
            contact_id: selectedContact?.id || queueContext.contactId || null,
            organisation_id: selectedOrg?.id || queueContext.organisationId || null,
          }),
        });
      }

      // Submit any kept live drafts to knowledge library for review
      const keptDrafts = liveDrafts.filter(d => d.kept);
      for (const draft of keptDrafts) {
        await fetch("/api/admin/engagement/ai/draft-pain-point", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phrase: draft.phrase,
            orgContext: selectedOrg ? `${selectedOrg.name}, ${selectedOrg.industry || ""}` : undefined,
            sourceCallId: saved.data?.id,
            sourceOrgId: selectedOrg?.id,
          }),
        });
      }

      setCallState("pre");
      setPageTab("call_records");
      router.push("/admin/engagement/live-call?tab=call_records");
    } finally {
      setSaving(false);
    }
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

  const inCall = callState === "active" || callState === "post";

  const hasRequiredConnection = Boolean(
    queueContext && (
      queueContext.enquiryId ||
      queueContext.opportunityId ||
      queueContext.sourceType === "opportunity" ||
      (queueContext.sourceType === "queue" && queueContext.sourceId)
    ),
  );

  const connectionLabel = queueContext?.sourceType === "enquiry"
    ? "Website enquiry"
    : queueContext?.sourceType === "queue"
      ? "Prospect queue"
      : queueContext?.sourceType === "opportunity"
        ? "Opportunity"
        : null;

  useEffect(() => {
    if (inCall && pageTab === "call_records") setPageTab("live_call");
  }, [inCall, pageTab]);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 border-b border-[#111111]/10 bg-white px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[#111111]">Calls</span>
            <div className="ml-3 flex overflow-hidden rounded-lg border border-[#111111]/15">
              {([
                ["live_call", "Live Call Assist"],
                ["call_records", "Call Records"],
              ] as [PageTab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (inCall && key === "call_records") return;
                    setPageTab(key);
                    if (key === "call_records") router.replace("/admin/engagement/live-call?tab=call_records");
                    else router.replace("/admin/engagement/live-call");
                  }}
                  disabled={inCall && key === "call_records"}
                  className={`px-4 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    pageTab === key ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {callState === "active" && (
            <div className="flex items-center gap-3 min-w-0">
              {queueContext && (
                <span className="hidden md:inline truncate max-w-[240px] text-xs text-[#6f6b62]">
                  {queueContext.orgName}
                  {queueContext.contactName ? ` · ${queueContext.contactName}` : ""}
                </span>
              )}
              <span className="rounded-full bg-[#f7f4ea] border border-[#111111]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62] capitalize shrink-0">
                {callType}
              </span>
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">{elapsed}</span>
              </div>
              <button
                onClick={endCall}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 shrink-0"
              >
                <PhoneOff className="h-3.5 w-3.5" /> End call
              </button>
            </div>
          )}
        </div>
      </div>

      {pageTab === "call_records" && !inCall && (
        <>
          <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Call Records</h1>
            <p className="mt-0.5 text-sm text-[#6f6b62]">Saved call records from completed live calls. Review summaries, notes, and AI-structured outcomes.</p>
          </div>
          <CallRecordsContent onStartCall={() => setPageTab("live_call")} />
        </>
      )}

      {pageTab === "live_call" && callState === "pre" && (
        <div className="px-8 py-6">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-[#111111]/10 bg-white p-8 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-xl text-[#111111]">Set up this call</h3>
                <p className="mt-1 text-sm text-[#6f6b62]">Link to a record, choose call type, then start your assisted call.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-2">
                    Link to record
                  </label>
                  {hasRequiredConnection && queueContext ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-emerald-900">
                            <Link2 className="inline h-3.5 w-3.5 mr-1" />
                            {connectionLabel} — {queueContext.orgName}
                          </p>
                          {queueContext.contactName && (
                            <p className="mt-0.5 text-xs text-emerald-800">{queueContext.contactName}</p>
                          )}
                          {queueContext.email && (
                            <p className="mt-0.5 text-xs text-emerald-700">{queueContext.email}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={clearLink}
                          className="shrink-0 text-xs font-semibold text-emerald-800 hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/30 p-4">
                      <div className="mb-3 flex overflow-hidden rounded-lg border border-[#111111]/15 bg-white">
                        {([
                          ["enquiry", "Enquiries", MessageSquare],
                          ["queue", "Prospect queue", Inbox],
                          ["opportunity", "Opportunities", Briefcase],
                        ] as const).map(([key, label, Icon]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => { setLinkSourceTab(key); setLinkResults([]); }}
                            className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-semibold transition-colors ${
                              linkSourceTab === key ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
                        <input
                          value={linkSearch}
                          onChange={(e) => setLinkSearch(e.target.value)}
                          placeholder={
                            linkSourceTab === "enquiry"
                              ? "Search enquiries by name or email…"
                              : linkSourceTab === "queue"
                                ? "Search prospect queue by org or contact…"
                                : "Search opportunities by title…"
                          }
                          className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
                        />
                      </div>
                      {linkSearching && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#6f6b62]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
                        </p>
                      )}
                      {linkResults.length > 0 && (
                        <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[#111111]/10 bg-white">
                          {linkResults.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              disabled={linkLoadingId === r.id}
                              onClick={() => void linkRecord(r.source, r.id)}
                              className="flex w-full flex-col items-start px-3 py-2.5 text-left hover:bg-[#f7f4ea] border-b border-[#111111]/5 last:border-0 disabled:opacity-50"
                            >
                              <span className="text-sm font-semibold text-[#111111]">{r.label}</span>
                              <span className="text-xs text-[#6f6b62]">{r.sublabel}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {linkSearch.trim() && !linkSearching && linkResults.length === 0 && (
                        <p className="mt-2 text-xs text-[#6f6b62]">No matches — try a different search.</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-2">
                    Call type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["prospecting", "discovery", "review", "support", "follow-up"].map((type) => (
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

                {hasRequiredConnection && (
                  <CallPrepContextPicker
                    sector={prepSector}
                    persona={prepPersona}
                    painPoints={prepPainPoints}
                    onSectorChange={setPrepSector}
                    onPersonaChange={setPrepPersona}
                    onPainPointsChange={setPrepPainPoints}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={startCall}
                disabled={!hasRequiredConnection}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1a5c42] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Phone className="h-5 w-5" /> Start call
              </button>
            </div>
          </div>
        </div>
      )}

      {pageTab === "live_call" && callState === "active" && (
        <div className="h-[calc(100vh-57px)] overflow-hidden">
          <CallAssistChat
            key={callSessionKey}
            messages={chatMessages}
            onMessagesChange={setChatMessages}
            callContext={getSessionCallContext()}
            callType={callType}
            orgName={selectedOrg?.name || queueContext?.orgName}
            contactName={
              selectedContact
                ? `${selectedContact.first_name} ${selectedContact.last_name || ""}`
                : queueContext?.contactName || undefined
            }
            className="h-full"
            placeholder="Ask for guidance, capture notes, or type anything from the call…"
          />
        </div>
      )}

      {/* Post-call summary */}
      {pageTab === "live_call" && callState === "post" && showSummary && (
        <div className="px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111111]">Call ended — review before saving</h2>
                <p className="text-sm text-[#6f6b62]">Structure your conversation, review the summary, then save to the linked record.</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="rounded-xl border border-[#111111]/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-3">Call details</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Linked record</p>
                    <p className="mt-0.5 text-[#111111]">
                      {connectionLabel || "Record"} — {queueContext?.orgName || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Contact</p>
                    <p className="mt-0.5 text-[#111111]">
                      {selectedContact
                        ? `${selectedContact.first_name} ${selectedContact.last_name || ""}`
                        : queueContext?.contactName || "Not recorded"}
                    </p>
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
                {(prepSector || prepPersona || prepPainPoints.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-[#111111]/10 flex flex-wrap gap-2">
                    {prepSector && (
                      <span className="rounded-full bg-[#f7f4ea] px-2.5 py-1 text-[10px] font-semibold text-[#6f6b62]">
                        {prepSector.name}
                      </span>
                    )}
                    {prepPersona && (
                      <span className="rounded-full bg-[#f7f4ea] px-2.5 py-1 text-[10px] font-semibold text-[#6f6b62]">
                        {prepPersona.persona_name}
                      </span>
                    )}
                    {prepPainPoints.map((pp) => (
                      <span key={pp.id} className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                        {pp.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[#111111]/10 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Call conversation</p>
                    <p className="mt-1 text-sm text-[#111111]">
                      {chatMessages.filter((m) => m.id !== "welcome").length} messages captured during the call
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTranscriptModal(true)}
                    disabled={chatMessages.filter((m) => m.id !== "welcome").length === 0}
                    className="shrink-0 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#063b32] hover:bg-[#f7f4ea] disabled:opacity-40"
                  >
                    View full transcript
                  </button>
                </div>
                {chatMessages.filter((m) => m.id !== "welcome").length > 0 && (
                  <div className="mt-4 max-h-40 overflow-y-auto space-y-3 rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/30 p-3">
                    {chatMessages
                      .filter((m) => m.id !== "welcome")
                      .slice(-4)
                      .map((msg) => (
                        <div key={msg.id} className={`text-xs ${msg.role === "user" ? "text-[#063b32]" : "text-[#6f6b62]"}`}>
                          <span className="font-semibold">{msg.role === "user" ? "You" : "Assistant"}:</span>{" "}
                          <span className="line-clamp-2">{msg.content}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[#111111]/10 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 shrink-0 text-[#063b32] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Help me structure these notes</p>
                      <p className="mt-0.5 text-xs text-[#6f6b62]">
                        AI reads your full conversation and separates notes, client commitments, and open questions.
                      </p>
                    </div>
                  </div>
                  {!structuredNotes && (
                    <button
                      type="button"
                      onClick={() => void structureNotes()}
                      disabled={structuring || chatMessages.filter((m) => m.id !== "welcome").length === 0}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-40"
                    >
                      {structuring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      {structuring ? "Structuring…" : "Structure notes"}
                    </button>
                  )}
                </div>

                {structureError && (
                  <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                    {structureError}
                    <button type="button" onClick={() => void structureNotes()} className="ml-2 underline hover:no-underline">Retry</button>
                  </div>
                )}

                {structuredNotes && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                      Review each section — uncheck anything you don&apos;t want saved
                    </p>

                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={structuredApproved.has("call_summary")}
                        onChange={(e) => setStructuredApproved((prev) => {
                          const n = new Set(prev);
                          if (e.target.checked) n.add("call_summary");
                          else n.delete("call_summary");
                          return n;
                        })}
                        className="mt-1 h-3.5 w-3.5 accent-[#063b32] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Call summary</p>
                          <button
                            type="button"
                            onClick={() => { setEditingSummary(!editingSummary); setEditedSummary(editedSummary || structuredNotes.call_summary); }}
                            className="text-[10px] text-[#063b32] hover:underline"
                          >
                            {editingSummary ? "Done editing" : "Edit"}
                          </button>
                        </div>
                        {editingSummary ? (
                          <textarea
                            value={editedSummary}
                            onChange={(e) => setEditedSummary(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-[#111111]/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#063b32] resize-none"
                          />
                        ) : (
                          <p className="text-xs text-[#111111]">{editedSummary || structuredNotes.call_summary}</p>
                        )}
                      </div>
                    </div>

                    {[
                      { key: "captured_notes", label: "Notes captured", value: structuredNotes.captured_notes },
                      { key: "client_commitments", label: "Client commitments", value: structuredNotes.client_commitments },
                      { key: "open_questions", label: "Open questions", value: structuredNotes.open_questions },
                      { key: "confirmed_pain_points", label: "Confirmed pain points", value: structuredNotes.confirmed_pain_points },
                      { key: "possible_pain_points", label: "Possible pain points (unconfirmed)", value: structuredNotes.possible_pain_points?.map((p: { topic: string; note: string }) => `${p.topic}: ${p.note}`) },
                      { key: "agreed_next_steps", label: "Agreed next steps", value: structuredNotes.agreed_next_steps },
                      { key: "desired_outcomes", label: "Desired outcomes", value: structuredNotes.desired_outcomes },
                      { key: "follow_up_tasks", label: "Follow-up tasks", value: structuredNotes.follow_up_tasks },
                      { key: "possible_vaxai_support", label: "Possible VAxAI support (to explore)", value: structuredNotes.possible_vaxai_support },
                      { key: "trust_concerns", label: "Trust / AI concerns raised", value: structuredNotes.trust_concerns },
                    ].filter((s) => Array.isArray(s.value) ? (s.value as unknown[]).length > 0 : !!s.value).map((section) => (
                      <div key={section.key} className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={structuredApproved.has(section.key)}
                          onChange={(e) => {
                            setStructuredApproved((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(section.key);
                              else next.delete(section.key);
                              return next;
                            });
                          }}
                          className="mt-0.5 h-3.5 w-3.5 accent-[#063b32]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">{section.label}</p>
                          {Array.isArray(section.value) ? (
                            <ul className="mt-0.5 space-y-0.5">
                              {(section.value as string[]).map((v, i) => (
                                <li key={i} className="text-xs text-[#111111]">· {v}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-0.5 text-xs text-[#111111]">{String(section.value ?? "")}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setShowTranscriptModal(true)}
                      className="text-xs font-semibold text-[#063b32] hover:underline"
                    >
                      Compare with full transcript
                    </button>
                  </div>
                )}
              </div>

              {structuredNotes && (
                <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <FileEdit className="h-5 w-5 shrink-0 text-[#063b32] mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[#063b32]">Draft a follow-up</p>
                        <p className="mt-0.5 text-xs text-[#6f6b62]">Optional — draft a follow-up email based on this call.</p>
                      </div>
                    </div>
                    {!followUpDraft && (
                      <button
                        type="button"
                        onClick={() => void generateFollowUp()}
                        disabled={draftingFollowUp}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-40"
                      >
                        {draftingFollowUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {draftingFollowUp ? "Drafting…" : "Draft follow-up"}
                      </button>
                    )}
                  </div>
                  {followUpError && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                      {followUpError}
                      <button type="button" onClick={() => void generateFollowUp()} className="ml-2 underline hover:no-underline">Retry</button>
                    </div>
                  )}
                  {followUpDraft && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Draft — edit before sending</p>
                        <button
                          type="button"
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
                        onChange={(e) => setFollowUpDraft((prev) => prev ? { ...prev, draft: e.target.value } : null)}
                        rows={8}
                        className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#063b32] resize-none"
                      />
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
                      Once saved, this creates an interaction record attached to your linked {connectionLabel?.toLowerCase() || "record"}.
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
                type="button"
                onClick={saveCallRecord}
                disabled={!summaryApproved || saving || !structuredNotes}
                className="flex items-center gap-2 rounded-lg bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save interaction record"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/engagement")}
                className="rounded-lg border border-[#111111]/15 px-5 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                Discard and go to overview
              </button>
            </div>
          </div>
        </div>
      )}

      {showTranscriptModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowTranscriptModal(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transcript-title"
          >
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4 shrink-0">
              <div>
                <h2 id="transcript-title" className="text-base font-semibold text-[#111111]">Call transcript</h2>
                <p className="text-xs text-[#6f6b62] mt-0.5">
                  {queueContext?.orgName}
                  {queueContext?.contactName ? ` · ${queueContext.contactName}` : ""} · {elapsed}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTranscriptModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f7f4ea]"
                aria-label="Close transcript"
              >
                <X className="h-4 w-4 text-[#6f6b62]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
              {chatMessages.filter((m) => m.id !== "welcome").length === 0 ? (
                <p className="text-sm text-[#6f6b62] text-center py-8">No messages in this call.</p>
              ) : (
                chatMessages
                  .filter((m) => m.id !== "welcome")
                  .map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#063b32] text-white"
                            : "bg-[#f7f4ea] text-[#111111]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.timestamp instanceof Date && (
                          <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-white/60" : "text-[#6f6b62]"}`}>
                            {msg.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
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
