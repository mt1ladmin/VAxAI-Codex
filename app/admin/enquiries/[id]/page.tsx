"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
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
  Persona,
  SectorProfile,
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
  status: string;
  connected_post_id: string | null;
  connected_post_title: string | null;
  next_action: string | null;
  next_action_date: string | null;
  admin_notes: string | null;
  last_action: string | null;
  last_action_date: string | null;
  contact_id: string | null;
  organisation_id: string | null;
  sector_snapshot: SectorProfile | null;
  persona_snapshot: Persona | null;
  posts?: { id: string; title: string; slug: string } | null;
};

function gmailComposeUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export default function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
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
  const [customCards, setCustomCards] = useState<CustomCard[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showPrepPicker, setShowPrepPicker] = useState(false);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [prepPickerList, setPrepPickerList] = useState<ProspectPrepClient[]>([]);
  const [prepPickerLoading, setPrepPickerLoading] = useState(false);
  const [showAddCustomCard, setShowAddCustomCard] = useState(false);
  const [customCardTitle, setCustomCardTitle] = useState("");
  const [customCardContent, setCustomCardContent] = useState("");
  const [expandedPrepCards, setExpandedPrepCards] = useState<Record<string, boolean>>({});
  const [promoting, setPromoting] = useState(false);
  const [activeTab, setActiveTab] = useState<HubTab>("overview");
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [creatingOpp, setCreatingOpp] = useState(false);
  const [linkingOpp, setLinkingOpp] = useState(false);
  const [oppPickerOpen, setOppPickerOpen] = useState(false);
  const [oppPickerList, setOppPickerList] = useState<EngagementOpportunity[]>([]);
  const [oppPickerLoading, setOppPickerLoading] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [expandedActivityOppId, setExpandedActivityOppId] = useState<string | null>(null);

  const loadLinkedPreps = useCallback(async () => {
    const res = await fetch(`/api/admin/engagement/prospect-preps?enquiry_id=${id}&limit=20`);
    const json = await res.json() as { data?: ProspectPrepClient[] };
    setLinkedPreps(json.data || []);
  }, [id]);

  const loadCrmData = useCallback(async (contactId?: string | null) => {
    setLoadingCrm(true);
    const interactionQueries = [
      fetch(`/api/admin/engagement/interactions?enquiry_id=${id}&limit=50`),
    ];
    if (contactId) {
      interactionQueries.push(
        fetch(`/api/admin/engagement/interactions?contact_id=${contactId}&limit=50`),
      );
    }
    const oppQueries = [
      fetch(`/api/admin/engagement/opportunities?enquiry_id=${id}&limit=20`),
    ];
    if (contactId) {
      oppQueries.push(
        fetch(`/api/admin/engagement/opportunities?contact_id=${contactId}&limit=20`),
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
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/enquiries/${id}`);
    const j = await res.json() as { data: Enquiry };
    if (j.data) {
      setEnquiry(j.data);
      setNextAction(j.data.next_action || "");
      setNextActionDate(j.data.next_action_date?.split("T")[0] || "");
      if (j.data.contact_id) {
        const cRes = await fetch(`/api/admin/engagement/contacts/${j.data.contact_id}`);
        const cJ = await cRes.json() as { data?: EngagementContact };
        if (cJ.data) setLinkedContact(cJ.data);
      } else {
        setLinkedContact(null);
      }
    }
    await loadLinkedPreps();
    await loadCrmData(j.data?.contact_id);
    setLoading(false);
  }, [id, loadLinkedPreps, loadCrmData]);

  useEffect(() => { void load(); }, [load]);

  const patchEnquiry = async (updates: Partial<Enquiry>) => {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const j = await res.json() as { data?: Enquiry; error?: string; hint?: string };
    if (!res.ok) {
      throw new Error(j.hint ? `${j.error}\n\n${j.hint}` : (j.error || "Failed to save enquiry"));
    }
    if (j.data) setEnquiry(j.data);
    return j.data;
  };

  const updateStatus = async (status: string) => {
    if (!enquiry || status === enquiry.status) return;
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await patchEnquiry({ status });
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNextAction = async () => {
    setSavingAction(true);
    await patchEnquiry({
      next_action: nextAction,
      next_action_date: nextActionDate || null,
    } as Partial<Enquiry>);
    setEditingNextAction(false);
    setSavingAction(false);
  };

  const promoteToCrm = async () => {
    setPromoting(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}/promote`, { method: "POST" });
      const j = await res.json() as { data?: { contact: EngagementContact; enquiry: Enquiry } };
      if (j.data) {
        setLinkedContact(j.data.contact);
        setEnquiry(j.data.enquiry);
        void loadCrmData(j.data.enquiry.contact_id);
      }
    } finally {
      setPromoting(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim() || !enquiry) return;
    setSavingNote(true);
    await patchEnquiry({
      admin_notes: enquiry.admin_notes
        ? `${enquiry.admin_notes}\n\n[${new Date().toLocaleDateString("en-GB")}] ${noteText}`
        : noteText,
      last_action: noteText.slice(0, 80),
      last_action_date: new Date().toISOString(),
    } as Partial<Enquiry>);
    setNoteText("");
    setShowAddNote(false);
    setSavingNote(false);
    void loadCrmData(enquiry.contact_id);
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
      await fetch(`/api/admin/engagement/prospect-preps/${prep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: id,
          contactId: enquiry?.contact_id || null,
          organisationId: enquiry?.organisation_id || null,
          sourceType: "enquiry",
          sourceLabel: enquiry ? `Website enquiry — ${enquiry.name}` : "Website enquiry",
        }),
      });
      void loadLinkedPreps();
    }
  };

  const onPrepSaved = (prep: ProspectPrepClient) => {
    addProspectPrep(prep);
    void loadLinkedPreps();
  };

  const addCustomCard = () => {
    if (!customCardTitle.trim() || !customCardContent.trim()) return;
    const card: CustomCard = {
      id: `custom-${Date.now()}`,
      title: customCardTitle.trim(),
      content: customCardContent.trim(),
    };
    setCustomCards((prev) => [...prev, card]);
    setCustomCardTitle("");
    setCustomCardContent("");
    setShowAddCustomCard(false);
  };

  const buildCallContext = (): ProspectCallContext | null => {
    if (!enquiry) return null;
    const submissionCard: CustomCard = {
      id: "enquiry-submission",
      title: "Website submission",
      content: [
        `Query type: ${enquiry.support_type}`,
        `Preferred contact: ${enquiry.preferred_contact || "—"}`,
        `Discovery call requested: ${enquiry.wants_discovery_call ? "Yes" : "No"}`,
        "",
        enquiry.details,
      ].join("\n"),
    };
    const allPreps = [...linkedPreps, ...prospectPreps.filter((p) => !linkedPreps.some((lp) => lp.id === p.id))];
    return {
      sourceType: "enquiry",
      sourceId: enquiry.id,
      enquiryId: enquiry.id,
      opportunityId: opportunities[0]?.id || null,
      contactId: enquiry.contact_id,
      organisationId: enquiry.organisation_id,
      queueId: `enquiry-${enquiry.id}`,
      orgName: enquiry.name,
      contactName: enquiry.name,
      email: enquiry.email,
      phone: enquiry.telephone,
      website: null,
      industry: enquiry.sector_snapshot?.name || null,
      location: null,
      linkedin: null,
      notes: enquiry.admin_notes || enquiry.details,
      nextAction: enquiry.next_action,
      nextActionDate: enquiry.next_action_date,
      sector: enquiry.sector_snapshot,
      persona: enquiry.persona_snapshot,
      aiPrepCards: [],
      prospectPreps: allPreps,
      customCards: [submissionCard, ...customCards],
    };
  };

  const goToLiveCall = () => {
    const context = buildCallContext();
    if (!context) return;
    sessionStorage.setItem("prospectCallContext", JSON.stringify(context));
    const allPreps = context.prospectPreps;
    if (allPreps.length > 0) {
      sessionStorage.setItem("currentProspectPreps", JSON.stringify(allPreps));
    } else {
      sessionStorage.removeItem("currentProspectPreps");
    }
    const params = new URLSearchParams();
    params.set("enquiry", enquiry!.id);
    if (enquiry?.contact_id) params.set("contact", enquiry.contact_id);
    if (enquiry?.organisation_id) params.set("org", enquiry.organisation_id);
    if (opportunities[0]?.id) params.set("opportunity", opportunities[0].id);
    router.push(`/admin/engagement/live-call?${params}`);
  };

  const createOpportunity = async () => {
    if (!enquiry) return;
    setCreatingOpp(true);
    try {
      const res = await fetch("/api/admin/engagement/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${enquiry.name} — ${enquiry.support_type}`.slice(0, 120),
          organisation_id: enquiry.organisation_id,
          primary_contact_id: enquiry.contact_id,
          enquiry_id: enquiry.id,
          stage: "Identified",
          notes: enquiry.details,
          next_action: enquiry.next_action,
        }),
      });
      const j = await res.json() as { data?: EngagementOpportunity };
      if (j.data) {
        setOpportunities((prev) => [j.data!, ...prev.filter((o) => o.id !== j.data!.id)]);
        setActiveTab("opportunities");
      }
    } finally {
      setCreatingOpp(false);
    }
  };

  const loadOppPicker = async () => {
    setOppPickerLoading(true);
    try {
      const res = await fetch("/api/admin/engagement/opportunities?limit=50");
      const j = await res.json() as { data?: EngagementOpportunity[] };
      setOppPickerList((j.data || []).filter((o) => o.enquiry_id !== id));
      setOppPickerOpen(true);
    } finally {
      setOppPickerLoading(false);
    }
  };

  const linkOpportunity = async (oppId: string) => {
    setLinkingOpp(true);
    try {
      const res = await fetch(`/api/admin/engagement/opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiry_id: id }),
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
  if (!enquiry) return <div className="p-8 text-sm text-[#6f6b62]">Enquiry not found.</div>;

  const postTitle = enquiry.connected_post_title || enquiry.posts?.title;
  const clientOpportunity = opportunities.find((o) =>
    ["Won", "Onboarding", "Active client"].includes(o.stage)
  ) ?? null;

  return (
    <div className="min-h-screen bg-white">
      <ProspectPrepModal
        open={showPrepModal}
        onClose={() => setShowPrepModal(false)}
        onSaved={onPrepSaved}
        defaultClientType={enquiry.support_type}
        defaultPrepNotes={enquiry.details}
        defaultName={`${enquiry.name} — ${enquiry.support_type}`.slice(0, 70)}
        source={{
          enquiryId: enquiry.id,
          contactId: enquiry.contact_id,
          organisationId: enquiry.organisation_id,
          sourceType: "enquiry",
          sourceLabel: `Website enquiry — ${enquiry.name}`,
        }}
      />

      <ConvertToClientModal
        open={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConverted={() => { setShowConvertModal(false); void load(); }}
        enquiryId={enquiry.id}
        enquiryName={enquiry.name}
        enquiryEmail={enquiry.email}
        enquiryPhone={enquiry.telephone}
        enquirySupportType={enquiry.support_type}
        enquiryDetails={enquiry.details}
        existingContactId={enquiry.contact_id}
        existingOrgId={enquiry.organisation_id}
      />

      <div className="border-b border-[#111111]/10 bg-white px-8 py-3">
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Website Enquiries
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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact details</p>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Name</p>
              <p className="text-sm font-semibold text-[#111111]">{enquiry.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Email</p>
              <a href={gmailComposeUrl(enquiry.email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
                <Mail className="h-3.5 w-3.5" /> {enquiry.email}
              </a>
            </div>
            {enquiry.telephone && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Telephone</p>
                <a href={`tel:${enquiry.telephone}`} className="flex items-center gap-1.5 text-sm text-[#111111]">
                  <Phone className="h-3.5 w-3.5" /> {enquiry.telephone}
                </a>
              </div>
            )}
            <div>
              <p className="text-[10px] text-[#6f6b62]">Received</p>
              <p className="flex items-center gap-1.5 text-sm text-[#111111]">
                <Calendar className="h-3.5 w-3.5 text-[#6f6b62]" />
                {new Date(enquiry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Submission</p>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Query type</p>
              <span className="mt-0.5 inline-block rounded-full bg-[#f5f274]/80 px-2.5 py-0.5 text-xs font-semibold text-[#111111]">{enquiry.support_type}</span>
            </div>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Description</p>
              <p className="mt-0.5 text-sm text-[#6f6b62] whitespace-pre-wrap leading-relaxed">{enquiry.details}</p>
            </div>
            {postTitle && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Related post</p>
                {enquiry.connected_post_id ? (
                  <Link href={`/admin/posts/${enquiry.connected_post_id}`} className="flex items-center gap-1 text-sm text-[#063b32] hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> {postTitle}
                  </Link>
                ) : (
                  <p className="text-sm text-[#111111]">{postTitle}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Status</p>
            <StatusSelect value={enquiry.status} onChange={(status) => void updateStatus(status)} loading={updatingStatus} />
            {statusError && (
              <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{statusError}</p>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Client record</p>
            {linkedContact && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
                  <User className="h-4 w-4 text-[#063b32]" />
                  {linkedContact.first_name} {linkedContact.last_name || ""}
                </p>
                {linkedContact.organisation && (
                  <p className="flex items-center gap-2 text-xs text-[#6f6b62]">
                    <Building2 className="h-3.5 w-3.5" /> {linkedContact.organisation.name}
                  </p>
                )}
              </div>
            )}
            {clientOpportunity ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-[#063b32]/8 px-3 py-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#063b32]" />
                  <span className="text-xs font-semibold text-[#063b32]">{clientOpportunity.stage}</span>
                </div>
                <Link
                  href={`/admin/clients/${linkedContact?.id}`}
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
                <a href={gmailComposeUrl(enquiry.email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
                  <Mail className="h-4 w-4" /> Send email
                </a>
                <button type="button" onClick={() => setShowPrepModal(true)} className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100">
                  <Sparkles className="h-4 w-4" /> New prospect prep
                </button>
                <button type="button" onClick={() => void createOpportunity()} disabled={creatingOpp} className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50">
                  {creatingOpp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />} Create opportunity
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
                      {enquiry.next_action ? "Edit" : "Add"}
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
                      <button type="button" onClick={() => { setEditingNextAction(false); setNextAction(enquiry.next_action || ""); setNextActionDate(enquiry.next_action_date?.split("T")[0] || ""); }} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
                    </div>
                  </div>
                ) : enquiry.next_action ? (
                  <div>
                    <p className="text-sm text-[#111111]">{enquiry.next_action}</p>
                    {enquiry.next_action_date && (
                      <p className="mt-1 text-xs text-[#6f6b62]">By {new Date(enquiry.next_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#6f6b62]/50">No next action set.</p>
                )}
              </div>

              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-1">Last activity</p>
                {enquiry.last_action ? (
                  <>
                    <p className="text-sm text-[#111111]">{enquiry.last_action}</p>
                    {enquiry.last_action_date && (
                      <p className="mt-1 text-xs text-[#6f6b62]">{new Date(enquiry.last_action_date).toLocaleString("en-GB")}</p>
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
                      <p className="text-sm font-semibold text-[#111111]">Enquiry received</p>
                      <p className="text-xs text-[#6f6b62]">{new Date(enquiry.created_at).toLocaleString("en-GB")}</p>
                      <p className="mt-1 text-sm text-[#6f6b62]">{enquiry.support_type} — {enquiry.details.slice(0, 120)}{enquiry.details.length > 120 ? "…" : ""}</p>
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
                  {interactions.length === 0 && linkedPreps.length === 0 && opportunities.length === 0 && !enquiry.last_action && (
                    <p className="text-sm text-[#6f6b62]/60 py-4 text-center">No activity yet. Start a call or add a note to begin tracking.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "calls" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Call records attached to this enquiry</p>
                <button type="button" onClick={goToLiveCall} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
                  <Phone className="h-4 w-4" /> Start call assist
                </button>
              </div>
              <InteractionList
                interactions={interactions}
                loading={loadingCrm}
                emptyMessage="No calls recorded for this enquiry yet. Start a call from here — it will be linked automatically and also appear in Live Call Assist history."
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
                <button type="button" onClick={() => void createOpportunity()} disabled={creatingOpp} className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                  {creatingOpp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create opportunity
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
              {enquiry.admin_notes ? (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <p className="text-sm text-[#111111] whitespace-pre-wrap">{enquiry.admin_notes}</p>
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