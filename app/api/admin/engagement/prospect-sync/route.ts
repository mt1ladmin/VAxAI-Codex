import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

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

const FIELD_MAP: Record<string, string> = {
  org: "raw_org_name",
  company: "raw_org_name",
  name: "raw_contact_name",
  contact: "raw_contact_name",
  email: "raw_email",
  phone: "raw_phone",
  website: "raw_website",
  industry: "raw_industry",
  sector: "raw_industry",
  location: "raw_location",
  city: "raw_location",
  linkedin: "raw_linkedin",
  notes: "raw_notes",
  comment: "raw_notes",
};

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "all"; // "files" | "ai" | "all"

  const results: any = { filesProcessed: 0, entriesCreated: 0, aiProcessed: 0, errors: [] as string[] };

  const BUCKET = "prospect-imports";

  if (mode === "files" || mode === "all") {
    const { data: files, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (listErr) {
      return NextResponse.json({ error: "Failed to list storage: " + listErr.message }, { status: 500 });
    }

    for (const f of files || []) {
      if (!f.name.toLowerCase().endsWith(".csv")) continue;

      const storagePath = `${BUCKET}/${f.name}`;

      // Use separate processed_files table for tracking (Supabase first)
      const { data: processed } = await supabase
        .from("prospect_processed_files")
        .select("id")
        .eq("storage_path", storagePath)
        .limit(1);

      if (processed && processed.length > 0) continue;

      try {
        const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(f.name);
        if (dlErr || !blob) {
          results.errors.push(`Download failed for ${f.name}`);
          continue;
        }

        const text = await blob.text();
        const rows = parseCSV(text);
        if (rows.length < 2) continue;

        const hdrs = rows[0];
        const dataRows = rows.slice(1);

        const columnMapping: Record<string, string> = {};
        hdrs.forEach((h) => {
          const key = h.toLowerCase().replace(/[\s_-]/g, "");
          for (const [match, field] of Object.entries(FIELD_MAP)) {
            if (key.includes(match)) {
              columnMapping[h] = field;
              break;
            }
          }
        });

        // Create lightweight batch
        const { data: batch, error: batchErr } = await supabase
          .from("prospect_import_batches")
          .insert({
            filename: f.name,
            original_csv: "",
            column_mapping: columnMapping,
            row_count: dataRows.length,
            imported_count: 0,
            status: "imported",
            notes: `Synced from Supabase Storage: ${storagePath}`,
          })
          .select()
          .single();

        if (batchErr || !batch) {
          results.errors.push(`Batch create failed for ${f.name}: ${batchErr?.message}`);
          continue;
        }

        const batchId = batch.id;
        let imported = 0;

        for (const row of dataRows) {
          const entry: Record<string, any> = { import_batch_id: batchId };
          hdrs.forEach((h, i) => {
            const field = columnMapping[h];
            if (field) entry[field] = row[i] || null;
          });

          // YES TO EVERYTHING: Use AI to enrich raw -> structured org/contact and insert on the fly (with dedup)
          try {
            const aiEnrichPrompt = `Raw prospect data from CSV:
${Object.entries(entry).map(([k,v]) => `${k}: ${v || ''}`).join('\n')}

Create structured data for EngagementOrganisation and EngagementContact.
Return ONLY valid JSON:
{
  "org": { "name": "...", "industry": "...", "website": "...", "location": "...", "size": "...", "description": "..." },
  "contact": { "first_name": "...", "last_name": "...", "professional_email": "...", "phone": "...", "role": "..." },
  "notes": "any extra"
}`;

            const aiMsg = await client.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 400,
              messages: [{ role: "user", content: aiEnrichPrompt }],
            });
            const aiText = (aiMsg.content[0] as any)?.text || "{}";
            const enriched = JSON.parse(aiText.replace(/```(json)?/g, "").trim());

            // Simple dedup check before insert (reuse AI logic later)
            const { data: matchOrgs } = await supabase
              .from("engagement_organisations")
              .select("id, name")
              .ilike("name", `%${enriched.org?.name || entry.raw_org_name}%`)
              .limit(3);

            if (!matchOrgs || matchOrgs.length === 0) {
              const { data: newOrg } = await supabase.from("engagement_organisations").insert({
                name: enriched.org?.name || entry.raw_org_name,
                industry: enriched.org?.industry || entry.raw_industry,
                website: enriched.org?.website || entry.raw_website,
                location: enriched.org?.location || entry.raw_location,
                description: enriched.org?.description,
                source: "prospect-sync",
              }).select("id").single();
              if (newOrg) entry.organisation_id = newOrg.id;
            } else {
              entry.organisation_id = matchOrgs[0].id;
              entry.duplicate_warning = "Potential duplicate org from AI enrich";
            }

            // Similar for contact
            if (enriched.contact?.first_name) {
              const { data: newContact } = await supabase.from("engagement_contacts").insert({
                organisation_id: entry.organisation_id,
                first_name: enriched.contact.first_name,
                last_name: enriched.contact.last_name,
                professional_email: enriched.contact.professional_email || entry.raw_email,
                phone: enriched.contact.phone || entry.raw_phone,
                role: enriched.contact.role,
                contact_source: "prospect-sync",
              }).select("id").single();
              if (newContact) entry.contact_id = newContact.id;
            }
          } catch (aiErr) {
            // Fallback to raw if AI fails
            console.error("AI enrich failed", aiErr);
          }

          const { error: qErr } = await supabase.from("prospect_queue").insert(entry);
          if (!qErr) imported++;
        }

        await supabase
          .from("prospect_import_batches")
          .update({ imported_count: imported })
          .eq("id", batchId);

        // Record in processed_files table
        await supabase.from("prospect_processed_files").insert({
          storage_path: storagePath,
          batch_id: batchId,
        });

        results.filesProcessed++;
        results.entriesCreated += imported;
      } catch (e: any) {
        results.errors.push(`Error processing ${f.name}: ${e.message}`);
      }
    }
  }

  if (mode === "ai" || mode === "all") {
    // Adjusted batch size to 10 for cost control and better AI accuracy per item
    const { data: pending } = await supabase
      .from("prospect_queue")
      .select("id, raw_org_name, raw_contact_name, raw_email, raw_phone, raw_website, raw_industry, raw_location, raw_linkedin, raw_notes, organisation_id, contact_id")
      .eq("status", "Needs review")
      .is("duplicate_warning", null)
      .limit(10);

    if (pending && pending.length > 0) {
      const { data: existingOrgs } = await supabase
        .from("engagement_organisations")
        .select("id, name, industry, website, location, size")
        .limit(100);

      const orgContext = (existingOrgs || [])
        .map((o) => `${o.id}: ${o.name} | ${o.industry || ''} | ${o.website || ''} | ${o.location || ''}`)
        .join("\n");

      for (const p of pending) {
        try {
          const prompt = `Prospect raw:
Org: ${p.raw_org_name || ""} (industry: ${p.raw_industry || ""}, loc: ${p.raw_location || ""})
Contact: ${p.raw_contact_name || ""} email:${p.raw_email || ""} phone:${p.raw_phone || ""}
Notes: ${p.raw_notes || ""}

Existing orgs (id: name | industry | website | location):
${orgContext}

AI task: Detect exact/near duplicate org or contact, data conflicts (e.g. mismatched industry for same name), or prior contact signals.
Return ONLY this JSON (no extra text):
{
  "is_duplicate": true/false,
  "duplicate_org_id": "uuid-or-null",
  "confidence": 0-100,
  "warning": "short clear explanation or null",
  "previous_contact": true/false,
  "suggested_org_updates": {} // optional fields to merge if partial match
}`;

          const msg = await client.messages.create({
            model: "claude-sonnet-4-6",  // upgraded for better duplicate reasoning
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
          });

          const text = (msg.content[0] as any)?.text || "{}";
          const parsed = JSON.parse(text.replace(/```(json)?/g, "").trim());

          const updates: any = {};
          if (parsed.is_duplicate && parsed.duplicate_org_id) {
            updates.duplicate_of_org_id = parsed.duplicate_org_id;
            updates.duplicate_warning = parsed.warning || "AI detected possible duplicate/conflict";
          } else if (parsed.warning) {
            updates.duplicate_warning = parsed.warning;
          }
          if (parsed.previous_contact) {
            updates.previous_contact_warning = "Previous contact history noted by AI";
          }
          // If AI suggests updates and we have org, we could merge but for safety only flag here

          if (Object.keys(updates).length > 0) {
            await supabase.from("prospect_queue").update(updates).eq("id", p.id);
            results.aiProcessed++;
          }
        } catch (e: any) {
          results.errors.push(`AI dedup error for ${p.id}: ${e.message}`);
        }
      }
    }
  }

  return NextResponse.json({ success: true, ...results });
}
