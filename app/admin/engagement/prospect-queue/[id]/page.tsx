"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ExternalLink,
  History,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import type { ProspectQueueEntry } from "@/lib/engagement/types";
import { PROSPECT_QUEUE_STATUSES, PROSPECT_QUEUE_STATUS_COLORS } from "@/lib/engagement/types";

type PrepCard = {
  what_we_know: string[];
  to_confirm: string[];
  previous_engagement_summary: string;
  sector_considerations: string[];
  pain_points_to_explore: Array<{ title: string; why: string; caution: string }>;
  discovery_questions: string[];
  suggested_opening: string;
  key_cautions: string[];
};

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
  const [prepCard, setPrepCard] = useState<PrepCard | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`);
    const j = await res.json() as { data: ProspectQueueEntry };
    if (j.data) {
      setEntry(j.data);
      setNextAction(j.data.next_action || "");
      setNextActionDate(j.data.next_action_date?.split("T")[0] || "");
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
    setPrepCard(null);
    const body: Record<string, string | undefined> = {};
    if (entry?.organisation_id) body.organisationId = entry.organisation_id;
    if (entry?.contact_id) body.contactId = entry.contact_id;
    const res = await fetch("/api/admin/engagement/ai/call-preparation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json() as { data?: PrepCard };
    if (j.data) setPrepCard(j.data);
    setLoadingPrep(false);
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
              {contactName && <span className="text-sm text-[#6f6b62]">{contactName}</span>}
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
            <Link
              href={`/admin/engagement/live-call${entry.organisation_id ? `?org=${entry.organisation_id}` : entry.contact_id ? `?contact=${entry.contact_id}` : ""}`}
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Phone className="h-4 w-4" /> Start call
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: contact details + status */}
        <div className="space-y-4">
          {/* Warnings */}
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

          {/* Contact details */}
          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact details</p>
            {contactName && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Name</p>
                <p className="text-sm font-semibold text-[#111111]">{contactName}</p>
              </div>
            )}
            {email && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Email</p>
                <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
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

          {/* Status */}
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

          {/* CRM links */}
          {(entry.organisation_id || entry.contact_id) && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">CRM record</p>
              {entry.organisation_id && (
                <Link
                  href={`/admin/engagement/pipeline/organisations/${entry.organisation_id}`}
                  className="flex items-center gap-2 text-sm text-[#063b32] hover:underline"
                >
                  View organisation record →
                </Link>
              )}
              {entry.contact_id && (
                <Link
                  href={`/admin/engagement/pipeline/contacts/${entry.contact_id}`}
                  className="flex items-center gap-2 text-sm text-[#063b32] hover:underline"
                >
                  View contact record →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right column: next action, notes, prep card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Next action */}
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

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/engagement/live-call${entry.organisation_id ? `?org=${entry.organisation_id}` : ""}`}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              <Phone className="h-4 w-4" /> Start call assist
            </Link>
            <a
              href={email ? `mailto:${email}` : "#"}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              <Mail className="h-4 w-4" /> Send email
            </a>
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              <Plus className="h-4 w-4" /> Add note
            </button>
          </div>

          {/* Add note inline */}
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

          {/* Notes */}
          {entry.raw_notes && (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-2">Notes</p>
              <p className="text-sm text-[#111111] whitespace-pre-wrap">{entry.raw_notes}</p>
            </div>
          )}

          {/* Last action */}
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

          {/* AI prep card */}
          {prepCard && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-violet-800">Pre-contact preparation</p>
                <button onClick={() => setPrepCard(null)} className="text-violet-400 hover:text-violet-700">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {prepCard.suggested_opening && (
                <div className="rounded-lg border border-violet-200 bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-600 mb-1">Suggested opening</p>
                  <p className="text-sm text-[#111111] italic">&ldquo;{prepCard.suggested_opening}&rdquo;</p>
                </div>
              )}

              {prepCard.what_we_know?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700 mb-1">Confirmed from CRM</p>
                  <ul className="space-y-0.5">
                    {prepCard.what_we_know.map((item, i) => (
                      <li key={i} className="text-xs text-[#111111] flex items-start gap-1.5">
                        <Check className="h-3 w-3 mt-0.5 text-emerald-600 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prepCard.to_confirm?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700 mb-1">Worth confirming</p>
                  <ul className="space-y-0.5">
                    {prepCard.to_confirm.map((item, i) => (
                      <li key={i} className="text-xs text-[#111111] flex items-start gap-1.5">
                        <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prepCard.discovery_questions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-700 mb-1">Discovery questions</p>
                  <ul className="space-y-1">
                    {prepCard.discovery_questions.map((q, i) => (
                      <li key={i} className="text-xs text-[#111111] rounded bg-white px-2.5 py-1.5 border border-violet-100">
                        &ldquo;{q}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prepCard.key_cautions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-red-600 mb-1">Key cautions</p>
                  <ul className="space-y-0.5">
                    {prepCard.key_cautions.map((c, i) => (
                      <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[10px] text-violet-600">AI-generated — review carefully before the call.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
