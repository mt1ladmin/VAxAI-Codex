"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
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
  Trash2,
  User,
  X,
} from "lucide-react";
import { CallAssistChat } from "@/components/admin/CallAssistChat";
import { ProspectPrepModal } from "@/components/admin/ProspectPrepModal";
import { StatusSelect } from "@/components/admin/StatusSelect";
import {
  ENQUIRY_STATUS_COLORS,
  enquiryStatusLabel,
} from "@/lib/enquiries/constants";
import type { CustomCard, PrepCard, ProspectCallContext } from "@/lib/engagement/call-context";
import type { ProspectPrepClient } from "@/lib/engagement/prospect-prep";
import type { EngagementContact, Persona, SectorProfile } from "@/lib/engagement/types";

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
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [aiPrepCards, setAiPrepCards] = useState<PrepCard[]>([]);
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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [promoting, setPromoting] = useState(false);
  const [sectors, setSectors] = useState<SectorProfile[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCallChat, setShowCallChat] = useState(false);

  const loadLinkedPreps = useCallback(async () => {
    const res = await fetch(`/api/admin/engagement/prospect-preps?enquiry_id=${id}&limit=20`);
    const json = await res.json() as { data?: ProspectPrepClient[] };
    setLinkedPreps(json.data || []);
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/enquiries/${id}`);
    const j = await res.json() as { data: Enquiry };
    if (j.data) {
      setEnquiry(j.data);
      setNextAction(j.data.next_action || "");
      setNextActionDate(j.data.next_action_date?.split("T")[0] || "");
      if (j.data.sector_snapshot?.id) setSelectedSectorId(j.data.sector_snapshot.id);
      if (j.data.persona_snapshot?.id) setSelectedPersonaId(j.data.persona_snapshot.id);
      if (j.data.contact_id) {
        const cRes = await fetch(`/api/admin/engagement/contacts/${j.data.contact_id}`);
        const cJ = await cRes.json() as { data?: EngagementContact };
        if (cJ.data) setLinkedContact(cJ.data);
      } else {
        setLinkedContact(null);
      }
    }
    await loadLinkedPreps();
    setLoading(false);
  }, [id, loadLinkedPreps]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/engagement/sectors?limit=50").then((r) => r.json()),
      fetch("/api/admin/engagement/personas?limit=50").then((r) => r.json()),
    ]).then(([sJ, pJ]) => {
      setSectors((sJ as { data: SectorProfile[] }).data || []);
      setPersonas((pJ as { data: Persona[] }).data || []);
    });
  }, []);

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
      }
    } finally {
      setPromoting(false);
    }
  };

  const saveSectorPersona = async () => {
    setSavingProfile(true);
    const sector = sectors.find((s) => s.id === selectedSectorId) || null;
    const persona = personas.find((p) => p.id === selectedPersonaId) || null;
    await patchEnquiry({
      sector_snapshot: sector,
      persona_snapshot: persona,
    } as Partial<Enquiry>);
    setSavingProfile(false);
  };

  const prepareForContact = async () => {
    if (!enquiry) return;
    setLoadingPrep(true);
    const res = await fetch("/api/admin/engagement/ai/call-preparation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callType: "discovery",
        orgName: enquiry.name,
        contactName: enquiry.name,
        supportType: enquiry.support_type,
        details: enquiry.details,
      }),
    });
    const j = await res.json() as { data?: Omit<PrepCard, "id"> };
    if (j.data) {
      const card: PrepCard = { ...j.data, id: `ai-${Date.now()}` };
      setAiPrepCards((prev) => [...prev, card]);
      setExpandedCards((prev) => ({ ...prev, [card.id]: true }));
    }
    setLoadingPrep(false);
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

  const addProspectPrep = (prep: ProspectPrepClient) => {
    if (prospectPreps.some((p) => p.id === prep.id)) return;
    setProspectPreps((prev) => [...prev, prep]);
    setExpandedCards((prev) => ({ ...prev, [`prep-${prep.id}`]: true }));
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
    setExpandedCards((prev) => ({ ...prev, [card.id]: true }));
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
      aiPrepCards,
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
    if (enquiry?.contact_id) params.set("contact", enquiry.contact_id);
    if (enquiry?.organisation_id) params.set("org", enquiry.organisation_id);
    router.push(`/admin/engagement/live-call${params.toString() ? `?${params}` : ""}`);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  if (loading) return <div className="p-8 text-sm text-[#6f6b62]">Loading…</div>;
  if (!enquiry) return <div className="p-8 text-sm text-[#6f6b62]">Enquiry not found.</div>;

  const statusColor = ENQUIRY_STATUS_COLORS[enquiry.status] || "bg-gray-100 text-gray-600";
  const postTitle = enquiry.connected_post_title || enquiry.posts?.title;
  const callContext = buildCallContext();

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

      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <Link
          href="/admin/enquiries"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Website Enquiries
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6b62] mb-1">Contact hub</p>
            <h1 className="text-2xl font-semibold text-[#111111]">{enquiry.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm text-[#6f6b62]">{enquiry.email}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor}`}>
                {enquiryStatusLabel(enquiry.status)}
              </span>
              {enquiry.wants_discovery_call && (
                <span className="rounded-full bg-[#063b32] px-2.5 py-0.5 text-[10px] font-semibold text-[#f5f274]">
                  Discovery call requested
                </span>
              )}
              {linkedContact && (
                <Link
                  href={`/admin/engagement/pipeline/contacts/${linkedContact.id}`}
                  className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <Link2 className="h-3 w-3" /> CRM linked
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void prepareForContact()}
              disabled={loadingPrep}
              className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
            >
              {loadingPrep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI prep
            </button>
            <button
              type="button"
              onClick={goToLiveCall}
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Phone className="h-4 w-4" /> Start call
            </button>
          </div>
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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">CRM record</p>
            {linkedContact ? (
              <div className="space-y-2">
                <Link href={`/admin/engagement/pipeline/contacts/${linkedContact.id}`} className="flex items-center gap-2 text-sm font-semibold text-[#063b32] hover:underline">
                  <User className="h-4 w-4" />
                  {linkedContact.first_name} {linkedContact.last_name || ""}
                </Link>
                {linkedContact.organisation && (
                  <Link href={`/admin/engagement/pipeline/organisations/${linkedContact.organisation.id}`} className="flex items-center gap-2 text-xs text-[#6f6b62] hover:text-[#063b32]">
                    <Building2 className="h-3.5 w-3.5" /> {linkedContact.organisation.name}
                  </Link>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void promoteToCrm()}
                disabled={promoting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#063b32]/30 bg-[#063b32]/5 px-4 py-3 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/10 disabled:opacity-50"
              >
                {promoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Create CRM contact
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Sector &amp; persona</p>
            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option value="">— Select sector —</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option value="">— Select persona —</option>
              {personas.map((p) => <option key={p.id} value={p.id}>{p.persona_name}</option>)}
            </select>
            <button
              type="button"
              onClick={() => void saveSectorPersona()}
              disabled={savingProfile}
              className="w-full rounded-lg bg-[#063b32]/10 px-3 py-2 text-xs font-semibold text-[#063b32] hover:bg-[#063b32]/20 disabled:opacity-50"
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
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
        </div>

        <div className="lg:col-span-2 space-y-4">
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

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={goToLiveCall} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
              <Phone className="h-4 w-4" /> Start call
            </button>
            <a href={gmailComposeUrl(enquiry.email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
              <Mail className="h-4 w-4" /> Send email
            </a>
            <button type="button" onClick={() => setShowAddNote(true)} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
              <Plus className="h-4 w-4" /> Add note
            </button>
            <button type="button" onClick={() => setShowPrepModal(true)} className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100">
              <Sparkles className="h-4 w-4" /> New prospect prep
            </button>
            <button type="button" onClick={() => void loadPrepPicker()} disabled={prepPickerLoading} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea] disabled:opacity-50">
              <History className="h-4 w-4" /> Attach existing prep
            </button>
            <button type="button" onClick={() => setShowCallChat((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50">
              <Sparkles className="h-4 w-4" /> {showCallChat ? "Hide" : "Preview"} call assistant
            </button>
          </div>

          {showCallChat && callContext && (
            <div className="rounded-xl border border-violet-200 overflow-hidden h-96">
              <CallAssistChat callContext={callContext} callType="discovery" orgName={enquiry.name} contactName={enquiry.name} />
            </div>
          )}

          {showPrepPicker && (
            <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Attach from history</p>
                <button type="button" onClick={() => setShowPrepPicker(false)} className="text-[#6f6b62] hover:text-[#111111]"><X className="h-4 w-4" /></button>
              </div>
              {prepPickerList.length === 0 ? (
                <p className="text-sm text-[#6f6b62]">No saved preps yet.</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-auto">
                  {prepPickerList.map((p) => (
                    <button key={p.id} type="button" onClick={() => addProspectPrep(p)} disabled={prospectPreps.some((x) => x.id === p.id)} className="w-full rounded-lg border border-[#111111]/10 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] disabled:opacity-40">
                      <span className="font-semibold text-[#111111]">{p.name}</span>
                      {p.sourceLabel && <span className="block text-[10px] text-[#6f6b62]">{p.sourceLabel}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {linkedPreps.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Linked prospect preps ({linkedPreps.length})</p>
              {linkedPreps.map((prep) => (
                <div key={prep.id} className="rounded-lg border border-emerald-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-[#111111]">{prep.name}</p>
                  {prep.sourceLabel && <p className="text-[10px] text-emerald-600">Created from: {prep.sourceLabel}</p>}
                  {prep.sector && <p className="text-xs text-[#6f6b62]">Sector: {prep.sector.name}</p>}
                </div>
              ))}
            </div>
          )}

          {showAddNote && (
            <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Add note</p>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="What happened? What was discussed?" className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => void saveNote()} disabled={savingNote || !noteText.trim()} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                  {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save note
                </button>
                <button type="button" onClick={() => { setShowAddNote(false); setNoteText(""); }} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
              </div>
            </div>
          )}

          {(aiPrepCards.length > 0 || prospectPreps.length > 0 || customCards.length > 0) && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Call preparation ({aiPrepCards.length + prospectPreps.length + customCards.length})</p>
              {aiPrepCards.map((card, idx) => (
                <div key={card.id} className="rounded-lg border border-violet-200 bg-violet-50 overflow-hidden">
                  <button type="button" onClick={() => toggleCard(card.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <span className="text-sm font-semibold text-violet-800">AI prep {idx + 1}</span>
                    <ChevronDown className={`h-4 w-4 text-violet-600 transition-transform ${expandedCards[card.id] ? "rotate-180" : ""}`} />
                  </button>
                  {expandedCards[card.id] && card.suggested_opening && (
                    <div className="border-t border-violet-200 px-4 py-3 text-sm italic text-[#111111]">&ldquo;{card.suggested_opening}&rdquo;</div>
                  )}
                </div>
              ))}
              {prospectPreps.map((prep) => (
                <div key={prep.id} className="rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/50 overflow-hidden">
                  <button type="button" onClick={() => toggleCard(`prep-${prep.id}`)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <span className="text-sm font-semibold text-[#111111]">{prep.name}</span>
                    <ChevronDown className={`h-4 w-4 text-[#6f6b62] transition-transform ${expandedCards[`prep-${prep.id}`] ? "rotate-180" : ""}`} />
                  </button>
                  {expandedCards[`prep-${prep.id}`] && (
                    <div className="border-t border-[#111111]/10 px-4 py-3 text-xs text-[#6f6b62] space-y-1">
                      {prep.sector && <p><span className="font-medium text-[#111111]">Sector:</span> {prep.sector.name}</p>}
                      {prep.persona && <p><span className="font-medium text-[#111111]">Persona:</span> {prep.persona.persona_name}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {enquiry.admin_notes && (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-2">Notes</p>
              <p className="text-sm text-[#111111] whitespace-pre-wrap">{enquiry.admin_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}