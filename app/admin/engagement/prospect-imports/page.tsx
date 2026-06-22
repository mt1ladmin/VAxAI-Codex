"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileUp,
  Inbox,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import type { ProspectImportBatch } from "@/lib/engagement/types";

// ----------------------------------------------------------------
// CSV helpers (no external library — split by line, handle quotes)
// ----------------------------------------------------------------
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  for (const line of lines) {
    const cells: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cells.push(cur.trim()); cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

const FIELD_OPTIONS = [
  { value: "", label: "— skip —" },
  { value: "raw_org_name", label: "Organisation name" },
  { value: "raw_contact_name", label: "Contact name" },
  { value: "raw_email", label: "Email" },
  { value: "raw_phone", label: "Phone" },
  { value: "raw_website", label: "Website" },
  { value: "raw_industry", label: "Industry" },
  { value: "raw_location", label: "Location" },
  { value: "raw_linkedin", label: "LinkedIn" },
  { value: "raw_notes", label: "Notes" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewing: "bg-blue-100 text-blue-700",
  imported: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
};

export default function ProspectImportsPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Prospect Imports (Deprecated)</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="font-semibold">This feature has been removed.</p>
          <p className="mt-2 text-sm">
            Prospect imports are now handled via <strong>Supabase Storage</strong> (upload CSVs to the <code>prospect-imports</code> bucket).
            Use the <strong>Sync from Supabase Storage</strong> and <strong>AI Dedup</strong> buttons on the <a href="/admin/engagement/prospect-queue" className="underline">Prospect Queue</a> page.
          </p>
          <p className="mt-2 text-sm">
            AI now automatically creates structured Organisations/Contacts on import and detects duplicates/conflicts.
          </p>
          <a href="/admin/engagement/prospect-queue" className="mt-4 inline-block rounded bg-[#063b32] px-4 py-2 text-sm text-white">Go to Prospect Queue → Sync</a>
        </div>
      </div>
    </div>
  );
}
