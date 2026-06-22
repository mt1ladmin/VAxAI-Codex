"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  History,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { ProspectQueueEntry } from "@/lib/engagement/types";
import { PROSPECT_QUEUE_STATUSES, PROSPECT_QUEUE_STATUS_COLORS } from "@/lib/engagement/types";
import type { ProspectPrepClient } from "@/lib/engagement/prospect-prep";

type PrepCard = {
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

type CustomCard = { id: string; title: string; content: string };

type ProspectCallContext = {
  queueId: string;
  orgName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  linkedin: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  aiPrepCards: PrepCard[];
  prospectPreps: ProspectPrepClient[];
  customCards: CustomCard[];
};

function gmailComposeUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<ProspectQueueEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editingNextAction, setEditingNextAction] = useState(false);
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [aiPrepCards, setAiPrepCards] = useState<PrepCard[]>([]);
  const [prospectPreps, setProspectPreps] = useState<ProspectPrepClient[]>([]);
  const [customCards, setCustomCards] = useState<CustomCard[]>([]);
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
  const [prepPickerList, setPrepPickerList] = useState<ProspectPrepClient[]>([]);
  const [prepPickerLoading, setPrepPickerLoading] = useState(false);
  const [showAddCustomCard, setShowAddCustomCard] = useState(false);
  const [customCardTitle, setCustomCardTitle] = useState("");
  const [customCardContent, setCustomCardContent] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

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
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = async (status: string) => {
    if (!entry) return;
    setUpdatingStatus(true);
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, last_action_date: new Date().toISOString() }),
    });
    const j = await res.json() as { data: ProspectQueueEntry };
    if (j.data) setEntry(j.data);
    setUpdatingStatus(false);
  };

  const saveNextAction = async () => {
    setSavingAction(true);
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        next_action: nextAction,
        next_action_date: nextActionDate || null,
      }),
    });
    const j = await res.json() as { data: ProspectQueueEntry };
    if (j.data) setEntry(j.data);
    setEditingNextAction(false);
    setSavingAction(false);
  };

  const prepareForContact = async () => {
    setLoadingPrep(true);
    const body: Record<string, string | undefined> = {};
    if (entry?.organisation_id) body.organisationId = entry.organisation_id;
    if (entry?.contact_id) body.contactId = entry.contact_id;
    const res = await fetch("/api/admin/engagement/ai/call-preparation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json() as { data?: Omit<PrepCard, "id"> };
    if (j.data) {
      const card: PrepCard = { ...j.data, id: `ai-${Date.now()}` };
      setAiPrepCards((prev) => [...prev, card]);
      setExpandedCards((prev) => ({ ...prev, [card.id]: true }));
    }
    setLoadingPrep(false);
  };

  const saveContact = async () => {
    setSavingContact(true);
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm),
    });
    const j = await res.json() as { data: ProspectQueueEntry };
    if (j.data) setEntry(j.data);
    setEditingContact(false);
    setSavingContact(false);
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_notes: entry?.raw_notes
          ? `${entry.raw_notes}\n\n[${new Date().toLocaleDateString("en-GB")}] ${noteText}`
          : noteText,
        last_action: noteText.slice(0, 80),
        last_action_date: new Date().toISOString(),
      }),
    });
    await load();
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

  const addCustomCard = () => {
    if (!customCardTitle.trim() || !customCardContent.trim()) return;
    const card: CustomCard = { id: `custom-${Date.now()}`, title: customCardTitle.trim(), content: customCardContent.trim() };
    setCustomCards((prev) => [...prev, card]);
    setExpandedCards((prev) => ({ ...prev, [card.id]: true }));
    setCustomCardTitle("");
    setCustomCardContent("");
    setShowAddCustomCard(false);
  };

  const buildCallContext = (): ProspectCallContext | null => {
    if (!entry) return null;
    const orgName = entry.organisation?.name || entry.raw_org_name || "Unknown organisation";
    const contactName = entry.contact
      ? `${entry.contact.first_name} ${entry.contact.last_name || ""}`.trim()
      : entry.raw_contact_name || null;
    return {
      queueId: entry.id,
      orgName,
      contactName,
      email: entry.contact?.professional_email || entry.raw_email || null,
      phone: entry.raw_phone || null,
      website: entry.raw_website || null,
      industry: entry.raw_industry || entry.organisation?.industry || null,
      location: entry.raw_location || null,
      linkedin: entry.raw_linkedin || null,
      notes: entry.raw_notes || null,
      nextAction: entry.next_action || null,
      nextActionDate: entry.next_action_date || null,
      aiPrepCards,
      prospectPreps,
      customCards,
    };
  };

  const goToLiveCall = () => {
    const context = buildCallContext();
    if (!context || !entry) return;
    sessionStorage.setItem("prospectCallContext", JSON.stringify(context));
    if (prospectPreps.length > 0) {
      sessionStorage.setItem("currentProspectPreps", JSON.stringify(prospectPreps));
    } else {
      sessionStorage.removeItem("currentProspectPreps");
    }
    const params = new URLSearchParams();
    if (entry.organisation_id) params.set("org", entry.organisation_id);
    if (entry.contact_id) params.set("contact", entry.contact_id);
    params.set("queue", entry.id);
    router.push(`/admin/engagement/live-call?${params}`);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  if (loading) return <div className="p-8 text-sm text-[#6f6b62]">Loading…</div>;
  if (!entry) return <div className="p-8 text-sm text-[#6f6b62]">Prospect not found.</div>;

  const orgName = entry.organisation?.name || entry.raw_org_name || "Unknown organisation";
  const contactName = entry.contact
    ? `${entry.contact.first_name} ${entry.contact.last_name || ""}`.trim()
    : entry.raw_contact_name || null;
  const email = entry.contact?.professional_email || entry.raw_email;
  const statusColor = PROSPECT_QUEUE_STATUS_COLORS[entry.status] || "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-white">
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

      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <button
          onClick={() => router.back()}
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Prospect Queue
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">{orgName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {contactName && (
                <button
                  type="button"
                  onClick={() => setEditingContact(true)}
                  className="inline-flex items-center gap-1 text-sm text-[#6f6b62] hover:text-[#063b32] hover:underline"
                >
                  {contactName}
                  <Pencil className="h-3 w-3" />
                </button>
              )}
              {entry.raw_industry && <span className="text-sm text-[#6f6b62]">· {entry.raw_industry}</span>}
              {entry.raw_location && <span className="text-sm text-[#6f6b62]">· {entry.raw_location}</span>}
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor}`}>
                {entry.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => void prepareForContact()}
              disabled={loadingPrep}
              className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
            >
              {loadingPrep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Prepare for contact
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
        {/* Left column: contact details + status */}
        <div className="space-y-4">
          {(entry.duplicate_warning || entry.previous_contact_warning) && (
            <div className="space-y-2">
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

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact details</p>
              <button type="button" onClick={() => setEditingContact(true)} className="text-xs text-[#063b32] hover:underline">
                Edit
              </button>
            </div>
            {contactName && (
              <button type="button" onClick={() => setEditingContact(true)} className="block w-full text-left">
                <p className="text-[10px] text-[#6f6b62]">Name</p>
                <p className="text-sm font-semibold text-[#111111] hover:text-[#063b32]">{contactName}</p>
              </button>
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
                  target="_blank" rel="noreferrer"
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
                  target="_blank" rel="noreferrer"
                  className="text-sm text-[#063b32] hover:underline"
                >
                  View profile
                </a>
              </div>
            )}
            {entry.raw_location && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Location</p>
                <p className="text-sm text-[#111111]">{entry.raw_location}</p>
              </div>
            )}
            {entry.raw_industry && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Industry</p>
                <p className="text-sm text-[#111111]">{entry.raw_industry}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Update status</p>
            <div className="space-y-1">
              {PROSPECT_QUEUE_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => void updateStatus(s)}
                  disabled={updatingStatus || entry.status === s}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-left transition-colors ${
                    entry.status === s
                      ? `${statusColor} cursor-default`
                      : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                  }`}
                >
                  {entry.status === s && <Check className="h-3.5 w-3.5 shrink-0" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {(entry.organisation_id || entry.contact_id) && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">CRM record</p>
              {entry.organisation_id && (
                <Link href={`/admin/engagement/pipeline/organisations/${entry.organisation_id}`} className="flex items-center gap-2 text-sm text-[#063b32] hover:underline">
                  View organisation record →
                </Link>
              )}
              {entry.contact_id && (
                <Link href={`/admin/engagement/pipeline/contacts/${entry.contact_id}`} className="flex items-center gap-2 text-sm text-[#063b32] hover:underline">
                  View contact record →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#111111]/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Next action</p>
              {!editingNextAction && (
                <button onClick={() => setEditingNextAction(true)} className="text-xs text-[#063b32] hover:underline">
                  {entry.next_action ? "Edit" : "Add"}
                </button>
              )}
            </div>
            {editingNextAction ? (
              <div className="space-y-2">
                <input
                  value={nextAction}
                  onChange={e => setNextAction(e.target.value)}
                  placeholder="What needs to happen next?"
                  className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
                <input
                  type="date"
                  value={nextActionDate}
                  onChange={e => setNextActionDate(e.target.value)}
                  className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => void saveNextAction()}
                    disabled={savingAction}
                    className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                  >
                    {savingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </button>
                  <button onClick={() => setEditingNextAction(false)} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
                    Cancel
                  </button>
                </div>
              </div>
            ) : entry.next_action ? (
              <div>
                <p className="text-sm text-[#111111]">{entry.next_action}</p>
                {entry.next_action_date && (
                  <p className="mt-1 text-xs text-[#6f6b62]">
                    By {new Date(entry.next_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6f6b62]/50">No next action set.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goToLiveCall}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              <Phone className="h-4 w-4" /> Start call assist
            </button>
            {email ? (
              <a
                href={gmailComposeUrl(email)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
              >
                <Mail className="h-4 w-4" /> Send email
              </a>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg border border-[#111111]/10 px-4 py-2 text-sm font-semibold text-[#6f6b62]/40 cursor-not-allowed">
                <Mail className="h-4 w-4" /> Send email
              </span>
            )}
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              <Plus className="h-4 w-4" /> Add note
            </button>
            <button
              onClick={() => void loadPrepPicker()}
              disabled={prepPickerLoading}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea] disabled:opacity-50"
            >
              <History className="h-4 w-4" /> Add prospect prep
            </button>
            <button
              onClick={() => setShowAddCustomCard(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              <Plus className="h-4 w-4" /> Add card
            </button>
          </div>

          {showPrepPicker && (
            <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Prospect prep history</p>
                <button type="button" onClick={() => setShowPrepPicker(false)} className="text-[#6f6b62] hover:text-[#111111]"><X className="h-4 w-4" /></button>
              </div>
              {prepPickerList.length === 0 ? (
                <p className="text-sm text-[#6f6b62]">No saved preps yet.</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-auto">
                  {prepPickerList.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProspectPrep(p)}
                      disabled={prospectPreps.some((x) => x.id === p.id)}
                      className="w-full rounded-lg border border-[#111111]/10 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] disabled:opacity-40"
                    >
                      <span className="font-semibold text-[#111111]">{p.name}</span>
                      {p.clientType && <span className="block text-xs text-[#6f6b62]">{p.clientType}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showAddCustomCard && (
            <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Add prospect card</p>
              <input
                value={customCardTitle}
                onChange={(e) => setCustomCardTitle(e.target.value)}
                placeholder="Card title"
                className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
              />
              <textarea
                value={customCardContent}
                onChange={(e) => setCustomCardContent(e.target.value)}
                rows={4}
                placeholder="Notes, talking points, or context for this call…"
                className="w-full resize-none rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
              />
              <div className="flex gap-2">
                <button type="button" onClick={addCustomCard} className="rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42]">Add card</button>
                <button type="button" onClick={() => setShowAddCustomCard(false)} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
              </div>
            </div>
          )}

          {showAddNote && (
            <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Add note</p>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={3}
                placeholder="What happened? What was discussed?"
                className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => void saveNote()}
                  disabled={savingNote || !noteText.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                >
                  {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save note
                </button>
                <button onClick={() => { setShowAddNote(false); setNoteText(""); }} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Prospect cards for call */}
          {(aiPrepCards.length > 0 || prospectPreps.length > 0 || customCards.length > 0) && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Call preparation ({aiPrepCards.length + prospectPreps.length + customCards.length})
              </p>
              <p className="text-xs text-[#6f6b62]">These cards will load when you start the call.</p>

              {aiPrepCards.map((card, idx) => (
                <div key={card.id} className="rounded-lg border border-violet-200 bg-violet-50 overflow-hidden">
                  <button type="button" onClick={() => toggleCard(card.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <span className="text-sm font-semibold text-violet-800">AI prep {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setAiPrepCards((p) => p.filter((c) => c.id !== card.id)); }} className="text-violet-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      <ChevronDown className={`h-4 w-4 text-violet-600 transition-transform ${expandedCards[card.id] ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {expandedCards[card.id] && (
                    <div className="border-t border-violet-200 px-4 py-3 space-y-2 text-sm">
                      {card.suggested_opening && <p className="italic text-[#111111]">&ldquo;{card.suggested_opening}&rdquo;</p>}
                      {card.discovery_questions?.length > 0 && (
                        <ul className="space-y-1 text-xs text-[#111111]">
                          {card.discovery_questions.map((q, i) => <li key={i}>· {q}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {prospectPreps.map((prep) => (
                <div key={prep.id} className="rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/50 overflow-hidden">
                  <button type="button" onClick={() => toggleCard(`prep-${prep.id}`)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <span className="text-sm font-semibold text-[#111111]">{prep.name}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setProspectPreps((p) => p.filter((c) => c.id !== prep.id)); }} className="text-[#6f6b62] hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      <ChevronDown className={`h-4 w-4 text-[#6f6b62] transition-transform ${expandedCards[`prep-${prep.id}`] ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {expandedCards[`prep-${prep.id}`] && (
                    <div className="border-t border-[#111111]/10 px-4 py-3 text-xs text-[#6f6b62] space-y-1">
                      {prep.sector && <p><span className="font-medium text-[#111111]">Sector:</span> {prep.sector.name}</p>}
                      {prep.persona && <p><span className="font-medium text-[#111111]">Persona:</span> {prep.persona.persona_name}</p>}
                      {prep.prepNotes && <p className="italic">{prep.prepNotes}</p>}
                    </div>
                  )}
                </div>
              ))}

              {customCards.map((card) => (
                <div key={card.id} className="rounded-lg border border-[#111111]/10 bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleCard(card.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <span className="text-sm font-semibold text-[#111111]">{card.title}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setCustomCards((p) => p.filter((c) => c.id !== card.id)); }} className="text-[#6f6b62] hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      <ChevronDown className={`h-4 w-4 text-[#6f6b62] transition-transform ${expandedCards[card.id] ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {expandedCards[card.id] && (
                    <div className="border-t border-[#111111]/10 px-4 py-3 text-sm text-[#111111] whitespace-pre-wrap">{card.content}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {entry.raw_notes && (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-2">Notes</p>
              <p className="text-sm text-[#111111] whitespace-pre-wrap">{entry.raw_notes}</p>
            </div>
          )}

          {(entry.last_action || entry.last_action_date) && (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-1">Last action</p>
              {entry.last_action && <p className="text-sm text-[#111111]">{entry.last_action}</p>}
              {entry.last_action_date && (
                <p className="mt-0.5 text-xs text-[#6f6b62]">
                  {new Date(entry.last_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}