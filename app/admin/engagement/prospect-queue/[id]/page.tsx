"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  History,
  Link2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";
import { ConvertToClientModal } from "@/components/admin/ConvertToClientModal";
import { CreateOpportunityModal } from "@/components/admin/CreateOpportunityModal";
import { InteractionList } from "@/components/admin/InteractionList";
import { OpportunityPreviewCard } from "@/components/admin/OpportunityPreviewCard";
import { PrepKnowledgeSummary } from "@/components/admin/PrepKnowledgeSummary";
import { ProspectPrepModal } from "@/components/admin/ProspectPrepModal";
import { StatusSelect } from "@/components/admin/StatusSelect";
import type { CustomCard, ProspectCallContext } from "@/lib/engagement/call-context";
import type { ProspectPrepClient } from "@/lib/engagement/prospect-prep";
import type {
  EngagementContact,
  EngagementInteraction,
  EngagementOpportunity,
  ProspectQueueEntry,
} from "@/lib/engagement/types";
import { STAGE_COLORS } from "@/lib/engagement/types";

type HubTab = "overview" | "preps" | "calls" | "opportunities" | "notes" | "activity";

const HUB_TABS: Array<{ id: HubTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "preps", label: "Preps" },
  { id: "calls", label: "Calls" },
  { id: "opportunities", label: "Opportunities" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activity" },
];

function gmailComposeUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<ProspectQueueEntry | null>(null);
  const [linkedContact, setLinkedContact] = useState<EngagementContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [editingNextAction, setEditingNextAction] = useState(false);
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [prospectPreps, setProspectPreps] = useState<ProspectPrepClient[]>([]);
  const [linkedPreps, setLinkedPreps] = useState<ProspectPrepClient[]>([]);
  const [customCards] = useState<CustomCard[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    raw_contact_name: "",
    raw_email: "",
    raw_phone: "",
    raw_linkedin: "",
  });
  const [savingContact, setSavingContact] = useState(false);
  const [showPrepPicker, setShowPrepPicker] = useState(false);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [prepPickerList, setPrepPickerList] = useState<ProspectPrepClient[]>([]);
  const [prepPickerLoading, setPrepPickerLoading] = useState(false);
  const [expandedPrepCards, setExpandedPrepCards] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<HubTab>("overview");
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [showCreateOppModal, setShowCreateOppModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [createOppPresetStage, setCreateOppPresetStage] = useState<string | undefined>();
  const [linkingOpp, setLinkingOpp] = useState(false);
  const [oppPickerOpen, setOppPickerOpen] = useState(false);
  const [oppPickerList, setOppPickerList] = useState<EngagementOpportunity[]>([]);
  const [oppPickerLoading, setOppPickerLoading] = useState(false);
  const [expandedActivityOppId, setExpandedActivityOppId] = useState<string | null>(null);

  const loadLinkedPreps = useCallback(async () => {
    const res = await fetch(`/api/admin/engagement/prospect-preps?queue_id=${id}&limit=20`);
    const json = await res.json() as { data?: ProspectPrepClient[] };
    setLinkedPreps(json.data || []);
  }, [id]);

  const loadCrmData = useCallback(async (contactId?: string | null, organisationId?: string | null) => {
    setLoadingCrm(true);
    const interactionQueries: Promise<Response>[] = [];
    if (contactId) {
      interactionQueries.push(
        fetch(`/api/admin/engagement/interactions?contact_id=${contactId}&limit=50`),
      );
    }
    if (organisationId) {
      interactionQueries.push(
        fetch(`/api/admin/engagement/interactions?organisation_id=${organisationId}&limit=50`),
      );
    }
    const oppQueries: Promise<Response>[] = [];
    if (contactId) {
      oppQueries.push(
        fetch(`/api/admin/engagement/opportunities?contact_id=${contactId}&limit=20`),
      );
    }
    if (organisationId) {
      oppQueries.push(
        fetch(`/api/admin/engagement/opportunities?organisation_id=${organisationId}&limit=20`),
      );
    }

    const [interactionResults, oppResults] = await Promise.all([
      Promise.all(interactionQueries.map((q) => q.then((r) => r.json()))),
      Promise.all(oppQueries.map((q) => q.then((r) => r.json()))),
    ]);

    const allInteractions = new Map<string, EngagementInteraction>();
    for (const j of interactionResults as Array<{ data?: EngagementInteraction[] }>) {
      for (const row of j.data || []) allInteractions.set(row.id, row);
    }
    const allOpps = new Map<string, EngagementOpportunity>();
    for (const j of oppResults as Array<{ data?: EngagementOpportunity[] }>) {
      for (const row of j.data || []) allOpps.set(row.id, row);
    }

    setInteractions(
      [...allInteractions.values()].sort(
        (a, b) => new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime(),
      ),
    );
    setOpportunities(
      [...allOpps.values()].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    );
    setLoadingCrm(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`);
    const j = await res.json() as { data: ProspectQueueEntry };
    if (j.data) {
      setEntry(j.data);
      setNextAction(j.data.next_action || "");
      setNextActionDate(j.data.next_action_date?.split("T")[0] || "");
      setContactForm({
        raw_contact_name: j.data.raw_contact_name || (j.data.contact ? `${j.data.contact.first_name} ${j.data.contact.last_name || ""}`.trim() : ""),
        raw_email: j.data.raw_email || j.data.contact?.professional_email || "",
        raw_phone: j.data.raw_phone || "",
        raw_linkedin: j.data.raw_linkedin || "",
      });
      if (j.data.contact_id) {
        const cRes = await fetch(`/api/admin/engagement/contacts/${j.data.contact_id}`);
        const cJ = await cRes.json() as { data?: EngagementContact };
        if (cJ.data) setLinkedContact(cJ.data);
      } else {
        setLinkedContact(null);
      }
    }
    await loadLinkedPreps();
    await loadCrmData(j.data?.contact_id, j.data?.organisation_id);
    setLoading(false);
  }, [id, loadLinkedPreps, loadCrmData]);

  useEffect(() => { void load(); }, [load]);

  const patchEntry = async (updates: Partial<ProspectQueueEntry>) => {
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const j = await res.json() as { data?: ProspectQueueEntry; error?: string };
    if (!res.ok) {
      throw new Error(j.error || "Failed to save prospect");
    }
    if (j.data) setEntry(j.data);
    return j.data;
  };

  const updateStatus = async (status: string) => {
    if (!entry || status === entry.status) return;
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await patchEntry({ status, last_action_date: new Date().toISOString() });
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNextAction = async () => {
    setSavingAction(true);
    await patchEntry({
      next_action: nextAction,
      next_action_date: nextActionDate || null,
    });
    setEditingNextAction(false);
    setSavingAction(false);
  };

  const saveContact = async () => {
    setSavingContact(true);
    try {
      await patchEntry(contactForm);
      setEditingContact(false);
    } finally {
      setSavingContact(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim() || !entry) return;
    setSavingNote(true);
    await patchEntry({
      raw_notes: entry.raw_notes
        ? `${entry.raw_notes}\n\n[${new Date().toLocaleDateString("en-GB")}] ${noteText}`
        : noteText,
      last_action: noteText.slice(0, 80),
      last_action_date: new Date().toISOString(),
    });
    setNoteText("");
    setShowAddNote(false);
    setSavingNote(false);
    void loadCrmData(entry.contact_id, entry.organisation_id);
  };

  const loadPrepPicker = async () => {
    setPrepPickerLoading(true);
    try {
      const res = await fetch("/api/admin/engagement/prospect-preps?limit=50");
      const json = await res.json() as { data?: ProspectPrepClient[] };
      setPrepPickerList(json.data || []);
      setShowPrepPicker(true);
    } finally {
      setPrepPickerLoading(false);
    }
  };

  const addProspectPrep = async (prep: ProspectPrepClient) => {
    if (prospectPreps.some((p) => p.id === prep.id)) return;
    setProspectPreps((prev) => [...prev, prep]);
    setExpandedPrepCards((prev) => ({ ...prev, [prep.id]: false }));
    if (prep.id && !linkedPreps.some((lp) => lp.id === prep.id)) {
      const labelOrg = entry?.organisation?.name || entry?.raw_org_name || "Unknown organisation";
      await fetch(`/api/admin/engagement/prospect-preps/${prep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueId: id,
          contactId: entry?.contact_id || null,
          organisationId: entry?.organisation_id || null,
          sourceType: "queue",
          sourceLabel: entry ? `Prospect queue — ${labelOrg}` : "Prospect queue",
        }),
      });
      void loadLinkedPreps();
    }
  };

  const onPrepSaved = (prep: ProspectPrepClient) => {
    addProspectPrep(prep);
    void loadLinkedPreps();
  };

  const buildCallContext = (): ProspectCallContext | null => {
    if (!entry) return null;
    const ctxOrgName = entry.organisation?.name || entry.raw_org_name || "Unknown organisation";
    const ctxContactName = entry.contact
      ? `${entry.contact.first_name} ${entry.contact.last_name || ""}`.trim()
      : entry.raw_contact_name || null;
    const ctxEmail = entry.contact?.professional_email || entry.raw_email;
    const prospectCard: CustomCard = {
      id: "queue-prospect",
      title: "Prospect details",
      content: [
        `Organisation: ${ctxOrgName}`,
        entry.raw_industry ? `Industry: ${entry.raw_industry}` : null,
        entry.raw_location ? `Location: ${entry.raw_location}` : null,
        entry.raw_website ? `Website: ${entry.raw_website}` : null,
        "",
        entry.raw_notes || "",
      ].filter((line) => line !== null).join("\n"),
    };
    const allPreps = [...linkedPreps, ...prospectPreps.filter((p) => !linkedPreps.some((lp) => lp.id === p.id))];
    return {
      sourceType: "queue",
      sourceId: entry.id,
      contactId: entry.contact_id,
      organisationId: entry.organisation_id,
      queueId: entry.id,
      opportunityId: opportunities[0]?.id || null,
      orgName: ctxOrgName,
      contactName: ctxContactName,
      email: ctxEmail || null,
      phone: entry.raw_phone || null,
      website: entry.raw_website || null,
      industry: entry.raw_industry || entry.organisation?.industry || null,
      location: entry.raw_location || null,
      linkedin: entry.raw_linkedin || null,
      notes: entry.raw_notes || null,
      nextAction: entry.next_action,
      nextActionDate: entry.next_action_date,
      aiPrepCards: [],
      prospectPreps: allPreps,
      customCards: [prospectCard, ...customCards],
    };
  };

  const goToLiveCall = () => {
    const context = buildCallContext();
    if (!context || !entry) return;
    sessionStorage.setItem("prospectCallContext", JSON.stringify(context));
    const allPreps = context.prospectPreps;
    if (allPreps.length > 0) {
      sessionStorage.setItem("currentProspectPreps", JSON.stringify(allPreps));
    } else {
      sessionStorage.removeItem("currentProspectPreps");
    }
    const params = new URLSearchParams();
    params.set("queue", entry.id);
    if (entry.contact_id) params.set("contact", entry.contact_id);
    if (entry.organisation_id) params.set("org", entry.organisation_id);
    if (opportunities[0]?.id) params.set("opportunity", opportunities[0].id);
    router.push(`/admin/engagement/live-call?${params}`);
  };

  const openCreateOpportunity = (presetStage?: string) => {
    setCreateOppPresetStage(presetStage);
    setShowCreateOppModal(true);
  };

  const handleOpportunityCreated = (opp: EngagementOpportunity) => {
    setOpportunities((prev) => [opp, ...prev.filter((o) => o.id !== opp.id)]);
    setActiveTab("opportunities");
    setCreateOppPresetStage(undefined);
  };

  const loadOppPicker = async () => {
    setOppPickerLoading(true);
    try {
      const res = await fetch("/api/admin/engagement/opportunities?limit=50");
      const j = await res.json() as { data?: EngagementOpportunity[] };
      const linkedIds = new Set(opportunities.map((o) => o.id));
      setOppPickerList((j.data || []).filter((o) => !linkedIds.has(o.id)));
      setOppPickerOpen(true);
    } finally {
      setOppPickerLoading(false);
    }
  };

  const linkOpportunity = async (oppId: string) => {
    if (!entry) return;
    setLinkingOpp(true);
    try {
      const res = await fetch(`/api/admin/engagement/opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisation_id: entry.organisation_id || undefined,
          primary_contact_id: entry.contact_id || undefined,
          queue_id: entry.id,
        }),
      });
      const j = await res.json() as { data?: EngagementOpportunity };
      if (j.data) {
        setOpportunities((prev) => [j.data!, ...prev.filter((o) => o.id !== j.data!.id)]);
        setOppPickerOpen(false);
        setActiveTab("opportunities");
      }
    } finally {
      setLinkingOpp(false);
    }
  };

  const togglePrepCard = (prepId: string) => {
    setExpandedPrepCards((prev) => ({ ...prev, [prepId]: !prev[prepId] }));
  };

  if (loading) return <div className="p-8 text-sm text-[#6f6b62]">Loading…</div>;
  if (!entry) return <div className="p-8 text-sm text-[#6f6b62]">Prospect not found.</div>;

  const orgName = entry.organisation?.name || entry.raw_org_name || "Unknown organisation";
  const contactName = entry.contact
    ? `${entry.contact.first_name} ${entry.contact.last_name || ""}`.trim()
    : entry.raw_contact_name || null;
  const email = entry.contact?.professional_email || entry.raw_email;
  const clientOpportunity = opportunities.find((o) =>
    ["Won", "Onboarding planned", "Contract sent", "Invoices sent", "Onboarding in progress", "Onboarding", "Active client", "Paused"].includes(o.stage)
  ) ?? null;

  return (
    <div className="min-h-screen bg-white">
      <ProspectPrepModal
        open={showPrepModal}
        onClose={() => setShowPrepModal(false)}
        onSaved={onPrepSaved}
        defaultClientType={entry.raw_industry || entry.organisation?.industry || ""}
        defaultPrepNotes={entry.raw_notes || ""}
        defaultName={`${orgName}`.slice(0, 70)}
        source={{
          queueId: entry.id,
          contactId: entry.contact_id,
          organisationId: entry.organisation_id,
          sourceType: "queue",
          sourceLabel: `Prospect queue — ${orgName}`,
        }}
      />

      <ConvertToClientModal
        open={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConverted={() => { setShowConvertModal(false); void load(); }}
        sourceType="queue"
        sourceId={entry.id}
        sourceLabel={orgName}
        contactName={contactName || orgName}
        contactEmail={email || ""}
        contactPhone={entry.raw_phone}
        supportType={entry.raw_industry || entry.organisation?.industry || "Prospect queue"}
        sourceDetails={entry.raw_notes || ""}
        existingContactId={entry.contact_id}
        existingOrgId={entry.organisation_id}
      />

      <CreateOpportunityModal
        open={showCreateOppModal}
        onClose={() => {
          setShowCreateOppModal(false);
          setCreateOppPresetStage(undefined);
        }}
        onCreated={handleOpportunityCreated}
        contextLabel={`Prospect queue — ${orgName}`}
        defaults={{
          title: `${orgName} — Prospect`.slice(0, 120),
          stage: createOppPresetStage ?? "Identified",
          desired_outcomes: entry.raw_notes ?? "",
          notes: entry.raw_notes ?? "",
          next_action: entry.next_action ?? "",
          expected_decision_date: entry.next_action_date?.split("T")[0] ?? "",
          organisation_id: entry.organisation_id,
          primary_contact_id: entry.contact_id,
          queue_id: entry.id,
        }}
        pipelineOnly
      />

      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
              <h2 className="text-base font-semibold text-[#111111]">Edit contact details</h2>
              <button type="button" onClick={() => setEditingContact(false)} className="text-[#6f6b62] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { key: "raw_contact_name" as const, label: "Name" },
                { key: "raw_email" as const, label: "Email", type: "email" },
                { key: "raw_phone" as const, label: "Phone", type: "tel" },
                { key: "raw_linkedin" as const, label: "LinkedIn", type: "url" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-[#6f6b62]">{label}</label>
                  <input
                    type={type || "text"}
                    value={contactForm[key]}
                    onChange={(e) => setContactForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-[#111111]/15 px-4 py-2.5 text-sm outline-none focus:border-[#063b32]"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
              <button type="button" onClick={() => setEditingContact(false)} className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveContact()}
                disabled={savingContact}
                className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-[#111111]/10 bg-white px-8 py-3">
        <Link
          href="/admin/engagement/prospect-queue"
          className="inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Prospect Queue
        </Link>
      </div>

      <div className="border-b border-[#111111]/10 px-8">
        <div className="flex gap-1 overflow-x-auto">
          {HUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-[#063b32] text-[#063b32]"
                  : "border-transparent text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {tab.label}
              {tab.id === "calls" && interactions.length > 0 && (
                <span className="ml-1.5 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">{interactions.length}</span>
              )}
              {tab.id === "preps" && linkedPreps.length > 0 && (
                <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-700">{linkedPreps.length}</span>
              )}
              {tab.id === "opportunities" && opportunities.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">{opportunities.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact &amp; prospect details</p>
              <button type="button" onClick={() => setEditingContact(true)} className="text-xs text-[#063b32] hover:underline">
                Edit
              </button>
            </div>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Organisation</p>
              <p className="text-sm font-semibold text-[#111111]">{orgName}</p>
            </div>
            {contactName && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Contact</p>
                <p className="text-sm font-semibold text-[#111111]">{contactName}</p>
              </div>
            )}
            {email && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Email</p>
                <a href={gmailComposeUrl(email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </a>
              </div>
            )}
            {entry.raw_phone && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Phone</p>
                <a href={`tel:${entry.raw_phone}`} className="flex items-center gap-1.5 text-sm text-[#111111]">
                  <Phone className="h-3.5 w-3.5" /> {entry.raw_phone}
                </a>
              </div>
            )}
            {entry.raw_website && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Website</p>
                <a
                  href={entry.raw_website.startsWith("http") ? entry.raw_website : `https://${entry.raw_website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> {entry.raw_website}
                </a>
              </div>
            )}
            {entry.raw_linkedin && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">LinkedIn</p>
                <a
                  href={entry.raw_linkedin.startsWith("http") ? entry.raw_linkedin : `https://${entry.raw_linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#063b32] hover:underline"
                >
                  View profile
                </a>
              </div>
            )}
            {(entry.raw_industry || entry.organisation?.industry) && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Industry</p>
                <p className="text-sm text-[#111111]">{entry.raw_industry || entry.organisation?.industry}</p>
              </div>
            )}
            {entry.raw_location && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Location</p>
                <p className="text-sm text-[#111111]">{entry.raw_location}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-[#6f6b62]">Added</p>
              <p className="flex items-center gap-1.5 text-sm text-[#111111]">
                <Calendar className="h-3.5 w-3.5 text-[#6f6b62]" />
                {new Date(entry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {(entry.duplicate_warning || entry.previous_contact_warning) && (
              <div className="space-y-2 pt-1">
                {entry.duplicate_warning && (
                  <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-orange-700">Possible duplicate</p>
                      <p className="text-xs text-orange-600 mt-0.5">{entry.duplicate_warning}</p>
                    </div>
                  </div>
                )}
                {entry.previous_contact_warning && (
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <History className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700">Previous contact</p>
                      <p className="text-xs text-blue-600 mt-0.5">{entry.previous_contact_warning}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Status</p>
            <StatusSelect value={entry.status} onChange={(status) => void updateStatus(status)} loading={updatingStatus} />
            {statusError && (
              <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{statusError}</p>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Client record</p>
            {(linkedContact || entry.contact) && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
                  <User className="h-4 w-4 text-[#063b32]" />
                  {linkedContact
                    ? `${linkedContact.first_name} ${linkedContact.last_name || ""}`
                    : contactName}
                </p>
                {(linkedContact?.organisation || entry.organisation) && (
                  <p className="flex items-center gap-2 text-xs text-[#6f6b62]">
                    <Building2 className="h-3.5 w-3.5" />
                    {linkedContact?.organisation?.name || entry.organisation?.name}
                  </p>
                )}
              </div>
            )}
            {clientOpportunity && entry.contact_id ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-[#063b32]/8 px-3 py-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#063b32]" />
                  <span className="text-xs font-semibold text-[#063b32]">{clientOpportunity.stage}</span>
                </div>
                <Link
                  href={`/admin/clients/${entry.contact_id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#063b32]/20 px-4 py-2.5 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/5"
                >
                  <Briefcase className="h-4 w-4" />
                  View client record
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConvertModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#063b32]/30 bg-[#063b32]/5 px-4 py-3 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/10"
              >
                <Briefcase className="h-4 w-4" />
                Convert to client
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {activeTab === "overview" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => setActiveTab("calls")} className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50">
                  <p className="text-2xl font-bold text-[#111111]">{interactions.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Call records</p>
                </button>
                <button type="button" onClick={() => setActiveTab("preps")} className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50">
                  <p className="text-2xl font-bold text-[#111111]">{linkedPreps.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Prospect preps</p>
                </button>
                <button type="button" onClick={() => setActiveTab("opportunities")} className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50">
                  <p className="text-2xl font-bold text-[#111111]">{opportunities.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Opportunities</p>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={goToLiveCall} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
                  <Phone className="h-4 w-4" /> Start call assist
                </button>
                {email ? (
                  <a href={gmailComposeUrl(email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
                    <Mail className="h-4 w-4" /> Send email
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg border border-[#111111]/10 px-4 py-2 text-sm font-semibold text-[#6f6b62]/40 cursor-not-allowed">
                    <Mail className="h-4 w-4" /> Send email
                  </span>
                )}
                <button type="button" onClick={() => setShowPrepModal(true)} className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100">
                  <Sparkles className="h-4 w-4" /> New prospect prep
                </button>
                <button type="button" onClick={() => openCreateOpportunity()} className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                  <Target className="h-4 w-4" /> Create opportunity
                </button>
                <button type="button" onClick={() => { setActiveTab("notes"); setShowAddNote(true); }} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
                  <Plus className="h-4 w-4" /> Add note
                </button>
              </div>

              <div className="rounded-xl border border-[#111111]/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Next action</p>
                  {!editingNextAction && (
                    <button type="button" onClick={() => setEditingNextAction(true)} className="text-xs text-[#063b32] hover:underline">
                      {entry.next_action ? "Edit" : "Add"}
                    </button>
                  )}
                </div>
                {editingNextAction ? (
                  <div className="space-y-2">
                    <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="What needs to happen next?" className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                    <input type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void saveNextAction()} disabled={savingAction} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                        {savingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                      </button>
                      <button type="button" onClick={() => { setEditingNextAction(false); setNextAction(entry.next_action || ""); setNextActionDate(entry.next_action_date?.split("T")[0] || ""); }} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
                    </div>
                  </div>
                ) : entry.next_action ? (
                  <div>
                    <p className="text-sm text-[#111111]">{entry.next_action}</p>
                    {entry.next_action_date && (
                      <p className="mt-1 text-xs text-[#6f6b62]">By {new Date(entry.next_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#6f6b62]/50">No next action set.</p>
                )}
              </div>

              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-1">Last activity</p>
                {entry.last_action ? (
                  <>
                    <p className="text-sm text-[#111111]">{entry.last_action}</p>
                    {entry.last_action_date && (
                      <p className="mt-1 text-xs text-[#6f6b62]">{new Date(entry.last_action_date).toLocaleString("en-GB")}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#6f6b62]/50">No activity recorded yet.</p>
                )}
              </div>
            </>
          )}

          {activeTab === "activity" && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Activity timeline</p>
              {loadingCrm ? (
                <p className="text-sm text-[#6f6b62]">Loading activity…</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3 rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/40 px-4 py-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#063b32]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Prospect added</p>
                      <p className="text-xs text-[#6f6b62]">{new Date(entry.created_at).toLocaleString("en-GB")}</p>
                      <p className="mt-1 text-sm text-[#6f6b62]">{orgName}</p>
                    </div>
                  </div>
                  {interactions.map((i) => (
                    <Link key={i.id} href={`/admin/engagement/interactions/${i.id}`} className="flex gap-3 rounded-lg border border-[#111111]/10 px-4 py-3 hover:bg-[#f7f4ea]/40">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#111111] capitalize">Call — {i.interaction_type}</p>
                        <p className="text-xs text-[#6f6b62]">{new Date(i.interaction_date).toLocaleString("en-GB")}</p>
                        {i.summary && <p className="mt-1 text-sm text-[#6f6b62] line-clamp-2">{i.summary}</p>}
                      </div>
                    </Link>
                  ))}
                  {linkedPreps.map((prep) => (
                    <div key={prep.id} className="flex gap-3 rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/40 px-4 py-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">Prospect prep linked</p>
                        <p className="text-sm text-[#111111]">{prep.name}</p>
                        {prep.createdAt && <p className="text-xs text-[#6f6b62]">{new Date(prep.createdAt).toLocaleString("en-GB")}</p>}
                      </div>
                    </div>
                  ))}
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setExpandedActivityOppId((id) => (id === opp.id ? null : opp.id))}
                        className="flex w-full gap-3 rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-3 text-left hover:bg-amber-50"
                      >
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#111111]">Opportunity linked</p>
                          <p className="text-sm text-[#111111]">{opp.title}</p>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>{opp.stage}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${expandedActivityOppId === opp.id ? "rotate-180" : ""}`} />
                      </button>
                      {expandedActivityOppId === opp.id && (
                        <OpportunityPreviewCard opportunity={opp} defaultExpanded />
                      )}
                    </div>
                  ))}
                  {interactions.length === 0 && linkedPreps.length === 0 && opportunities.length === 0 && !entry.last_action && (
                    <p className="text-sm text-[#6f6b62]/60 py-4 text-center">No activity yet. Start a call or add a note to begin tracking.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "calls" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Call records attached to this prospect</p>
                <button type="button" onClick={goToLiveCall} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
                  <Phone className="h-4 w-4" /> Start call assist
                </button>
              </div>
              <InteractionList
                interactions={interactions}
                loading={loadingCrm}
                emptyMessage="No calls recorded for this prospect yet. Start a call from here — it will be linked automatically and also appear in Live Call Assist history."
              />
            </div>
          )}

          {activeTab === "preps" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setShowPrepModal(true)} className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100">
                  <Sparkles className="h-4 w-4" /> New prospect prep
                </button>
                <button type="button" onClick={() => void loadPrepPicker()} disabled={prepPickerLoading} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea] disabled:opacity-50">
                  <History className="h-4 w-4" /> Attach existing prep
                </button>
                <button type="button" onClick={goToLiveCall} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
                  <Phone className="h-4 w-4" /> Start call assist
                </button>
              </div>

              {showPrepPicker && (
                <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Attach from history</p>
                    <button type="button" onClick={() => setShowPrepPicker(false)} className="text-[#6f6b62] hover:text-[#111111]"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {prepPickerList.map((p) => (
                      <button key={p.id} type="button" onClick={() => void addProspectPrep(p)} disabled={linkedPreps.some((x) => x.id === p.id)} className="w-full rounded-lg border border-[#111111]/10 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] disabled:opacity-40">
                        <span className="font-semibold text-[#111111]">{p.name}</span>
                        {p.sourceLabel && <span className="block text-[10px] text-[#6f6b62]">{p.sourceLabel}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {linkedPreps.length > 0 ? (
                <div className="space-y-2">
                  {linkedPreps.map((prep) => {
                    const expanded = !!expandedPrepCards[prep.id];
                    return (
                      <div key={prep.id} className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => togglePrepCard(prep.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f7f4ea]/50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#111111]">{prep.name}</p>
                            {prep.sourceLabel && <p className="text-[10px] text-[#6f6b62]">{prep.sourceLabel}</p>}
                          </div>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        {expanded && (
                          <div className="border-t border-[#111111]/10 bg-[#f7f4ea]/30 px-4 py-3 space-y-2">
                            <PrepKnowledgeSummary
                              sector={prep.sector}
                              persona={prep.persona}
                              relevantPains={prep.relevantPains}
                              compact
                            />
                            {prep.prepNotes && <p className="text-sm text-[#6f6b62] whitespace-pre-wrap">{prep.prepNotes}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]/60 py-8 text-center">No prospect preps linked yet.</p>
              )}
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openCreateOpportunity()} className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                  <Plus className="h-4 w-4" /> Create opportunity
                </button>
                <button type="button" onClick={() => void loadOppPicker()} disabled={oppPickerLoading} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea] disabled:opacity-50">
                  <Link2 className="h-4 w-4" /> Link existing
                </button>
              </div>

              {oppPickerOpen && (
                <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Link opportunity</p>
                    <button type="button" onClick={() => setOppPickerOpen(false)} className="text-[#6f6b62] hover:text-[#111111]"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {oppPickerList.map((o) => (
                      <button key={o.id} type="button" onClick={() => void linkOpportunity(o.id)} disabled={linkingOpp} className="w-full rounded-lg border border-[#111111]/10 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] disabled:opacity-40">
                        <span className="font-semibold text-[#111111]">{o.title}</span>
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[o.stage] || "bg-gray-100 text-gray-600"}`}>{o.stage}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {opportunities.length > 0 ? (
                <div className="space-y-2">
                  {opportunities.map((opp) => (
                    <OpportunityPreviewCard key={opp.id} opportunity={opp} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]/60 py-8 text-center">No opportunities linked yet.</p>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Notes &amp; admin log</p>
                <button
                  type="button"
                  onClick={() => setShowAddNote(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
                >
                  <Plus className="h-4 w-4" /> Add note
                </button>
              </div>
              {showAddNote && (
                <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
                  <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="What happened? What was discussed?" className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void saveNote()} disabled={savingNote || !noteText.trim()} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                      {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save note
                    </button>
                    <button type="button" onClick={() => { setShowAddNote(false); setNoteText(""); }} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
                  </div>
                </div>
              )}
              {entry.raw_notes ? (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <p className="text-sm text-[#111111] whitespace-pre-wrap">{entry.raw_notes}</p>
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]/60 py-8 text-center">No notes yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}