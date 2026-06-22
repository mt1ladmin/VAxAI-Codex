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
  const [batches, setBatches] = useState<ProspectImportBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [dragging, setDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [filename, setFilename] = useState("");
  const [rawCsv, setRawCsv] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/engagement/prospect-imports?limit=30");
    const j = await res.json() as { data: ProspectImportBatch[] };
    setBatches(j.data || []);
    setLoading(false);
  };

  const handleFile = (file: File) => {
    setImportError(null);
    setImportSuccess(null);
    setShowPreview(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawCsv(text);
      setFilename(file.name);
      const rows = parseCSV(text);
      if (rows.length < 2) { setImportError("CSV has no data rows."); return; }
      const hdrs = rows[0];
      setHeaders(hdrs);
      setParsedRows(rows.slice(1));
      // Auto-map obvious columns
      const autoMap: Record<string, string> = {};
      hdrs.forEach((h) => {
        const lower = h.toLowerCase().replace(/[\s_-]/g, "");
        if (lower.includes("org") || lower.includes("company") || lower.includes("business")) autoMap[h] = "raw_org_name";
        else if (lower.includes("contact") || lower.includes("name")) autoMap[h] = "raw_contact_name";
        else if (lower.includes("email")) autoMap[h] = "raw_email";
        else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("tel")) autoMap[h] = "raw_phone";
        else if (lower.includes("website") || lower.includes("url") || lower.includes("web")) autoMap[h] = "raw_website";
        else if (lower.includes("industry") || lower.includes("sector")) autoMap[h] = "raw_industry";
        else if (lower.includes("location") || lower.includes("city") || lower.includes("town") || lower.includes("address")) autoMap[h] = "raw_location";
        else if (lower.includes("linkedin")) autoMap[h] = "raw_linkedin";
        else if (lower.includes("note") || lower.includes("comment") || lower.includes("description")) autoMap[h] = "raw_notes";
      });
      setMapping(autoMap);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const previewRows = parsedRows.slice(0, 5).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      const field = mapping[h];
      if (field) obj[field] = row[i] || "";
    });
    return obj;
  });

  const handleImport = async () => {
    setImporting(true);
    setImportError(null);
    setImportSuccess(null);

    // 1. Create batch record
    const batchRes = await fetch("/api/admin/engagement/prospect-imports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename,
        original_csv: rawCsv,
        column_mapping: mapping,
        row_count: parsedRows.length,
        status: "reviewing",
      }),
    });
    const batchJson = await batchRes.json() as { data?: ProspectImportBatch; error?: string };
    if (!batchRes.ok || !batchJson.data) {
      setImportError(batchJson.error || "Failed to create import batch.");
      setImporting(false);
      return;
    }
    const batchId = batchJson.data.id;

    // 2. Create queue entries
    let importedCount = 0;
    let failed = 0;
    for (const row of parsedRows) {
      const entry: Record<string, string | null> = { import_batch_id: batchId };
      headers.forEach((h, i) => {
        const field = mapping[h];
        if (field) entry[field] = row[i] || null;
      });
      const res = await fetch("/api/admin/engagement/prospect-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (res.ok) importedCount++; else failed++;
    }

    // 3. Update batch
    await fetch(`/api/admin/engagement/prospect-imports/${batchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imported_count: importedCount, status: "imported" }),
    });

    setImportSuccess(`Imported ${importedCount} prospects${failed > 0 ? ` (${failed} failed)` : ""}.`);
    setImporting(false);
    setParsedRows([]);
    setHeaders([]);
    setMapping({});
    setFilename("");
    setRawCsv("");
    setShowPreview(false);
    fetchBatches();
  };

  const resetUpload = () => {
    setParsedRows([]);
    setHeaders([]);
    setMapping({});
    setFilename("");
    setRawCsv("");
    setShowPreview(false);
    setImportError(null);
    setImportSuccess(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-0.5 text-2xl font-semibold text-[#111111]">Prospect Imports</h1>
        <p className="mt-1 text-sm text-[#6f6b62]">Upload a CSV to add prospects to the work queue.</p>
      </div>

      <div className="px-8 py-8 max-w-4xl space-y-10">

        {/* Upload zone */}
        {!filename ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors py-16 ${
              dragging ? "border-[#063b32] bg-[#063b32]/5" : "border-[#111111]/15 hover:border-[#063b32]/40 bg-[#f7f4ea]/40"
            }`}
          >
            <FileUp className={`h-10 w-10 ${dragging ? "text-[#063b32]" : "text-[#6f6b62]/50"}`} />
            <div className="text-center">
              <p className="font-semibold text-[#111111]">Drop a CSV file here</p>
              <p className="text-sm text-[#6f6b62] mt-0.5">or click to browse</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-[#111111]/10 overflow-hidden">
            {/* File bar */}
            <div className="flex items-center justify-between bg-[#f7f4ea] px-5 py-3 border-b border-[#111111]/10">
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-[#063b32]" />
                <span className="text-sm font-semibold text-[#111111]">{filename}</span>
                <span className="text-xs text-[#6f6b62]">{parsedRows.length} rows</span>
              </div>
              <button onClick={resetUpload} className="text-[#6f6b62] hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Column mapping */}
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Map columns</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {headers.map((h) => (
                  <div key={h} className="space-y-1">
                    <label className="block text-xs font-semibold text-[#111111] truncate" title={h}>{h}</label>
                    <select
                      value={mapping[h] || ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                      className="w-full rounded-lg border border-[#111111]/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#063b32]"
                    >
                      {FIELD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview toggle */}
            <div className="border-t border-[#111111]/10 px-5 py-3">
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-[#063b32] hover:text-[#1a5c42]"
              >
                {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showPreview ? "Hide preview" : "Preview first 5 rows"}
              </button>
              {showPreview && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-[#111111]/10">
                  <table className="min-w-full text-xs">
                    <thead className="bg-[#f7f4ea]">
                      <tr>
                        {FIELD_OPTIONS.filter(f => f.value && Object.values(mapping).includes(f.value)).map(f => (
                          <th key={f.value} className="px-3 py-2 text-left font-semibold text-[#6f6b62] whitespace-nowrap">{f.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-t border-[#111111]/5">
                          {FIELD_OPTIONS.filter(f => f.value && Object.values(mapping).includes(f.value)).map(f => (
                            <td key={f.value} className="px-3 py-2 text-[#111111] max-w-[180px] truncate">{row[f.value] || ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-[#111111]/10 px-5 py-4 flex items-center gap-3">
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 rounded-lg bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {importing ? "Importing…" : `Import ${parsedRows.length} prospects`}
              </button>
              <button onClick={resetUpload} className="rounded-lg border border-[#111111]/15 px-4 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
                Cancel
              </button>
            </div>
          </div>
        )}

        {importError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{importError}</p>
          </div>
        )}
        {importSuccess && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-700">{importSuccess}</p>
          </div>
        )}

        {/* Previous batches */}
        <div>
          <h2 className="text-base font-semibold text-[#111111] mb-4">Import history</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6f6b62]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : batches.length === 0 ? (
            <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/40 py-12 text-center">
              <Inbox className="mx-auto h-8 w-8 text-[#6f6b62]/30 mb-2" />
              <p className="text-sm text-[#6f6b62]">No imports yet.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f7f4ea] border-b border-[#111111]/10">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">File</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Date</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#6f6b62]">Rows</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#6f6b62]">Imported</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} className="border-t border-[#111111]/5 hover:bg-[#f7f4ea]/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/engagement/prospect-imports/${b.id}`} className="font-semibold text-[#063b32] hover:underline">
                          {b.filename}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#6f6b62]">
                        {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right text-[#6f6b62]">{b.row_count ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-[#6f6b62]">{b.imported_count}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-500"}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
