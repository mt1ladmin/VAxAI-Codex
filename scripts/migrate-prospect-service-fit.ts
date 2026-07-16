/**
 * Bulk reassessment of prospect catalog service-fit fields.
 *
 * Usage:
 *   npx tsx scripts/migrate-prospect-service-fit.ts --dry-run --sample=5
 *   npx tsx scripts/migrate-prospect-service-fit.ts --apply
 */
import fs from "node:fs";
import path from "node:path";
import { reassessProspectRecord } from "../lib/engagement/service-fit/assess";
import type { ProspectOutreachCatalog, ProspectOutreachRecord } from "../lib/engagement/prospect-outreach/types";

const CATALOG_PATH = path.join(
  process.cwd(),
  "lib/engagement/prospect-outreach/catalog.json",
);

const CHANGED_FIELDS = [
  "need_score",
  "engagement_approach",
  "likely_need",
  "complexity_level",
  "complexity_rationale",
  "vaxai_direct_support",
  "vaxai_partial_support",
  "partner_support",
  "capability_boundaries",
  "recommended_engagement",
  "engagement_basis",
  "service_fit_summary",
  "evidence_summary",
  "open_questions",
  "systems_landscape",
  "admin_capacity",
  "ai_automation_use",
  "data_sensitivity",
  "internal_capability",
  "accessibility_considerations",
  "build_vs_improve",
  "bespoke_build_fit",
  "bespoke_build_note",
] as const;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apply: args.includes("--apply"),
    sample: Number(args.find((a) => a.startsWith("--sample="))?.split("=")[1] || "0"),
  };
}

function backupCatalog(catalog: ProspectOutreachCatalog) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "lib/engagement/prospect-outreach/backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `catalog.backup.${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(catalog, null, 2));
  return backupPath;
}

function summarizeDiff(before: ProspectOutreachRecord, after: ProspectOutreachRecord) {
  const changed: string[] = [];
  for (const key of CHANGED_FIELDS) {
    const a = JSON.stringify(before[key as keyof ProspectOutreachRecord] ?? null);
    const b = JSON.stringify(after[key as keyof ProspectOutreachRecord] ?? null);
    if (a !== b) changed.push(key);
  }
  return changed;
}

function main() {
  const { apply, sample } = parseArgs();
  const raw = fs.readFileSync(CATALOG_PATH, "utf8");
  const catalog = JSON.parse(raw) as ProspectOutreachCatalog;

  console.log(`Catalog records: ${catalog.prospects.length}`);
  console.log(`Fields updated by migration: ${CHANGED_FIELDS.join(", ")}`);
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}${sample ? ` (sample ${sample})` : ""}`);

  if (sample > 0) {
    const targets = catalog.prospects.slice(0, sample);
    let changedCount = 0;
    for (const record of targets) {
      const next = reassessProspectRecord(record);
      const changed = summarizeDiff(record, next);
      if (changed.length) changedCount += 1;
      console.log("\n---", next.organisation_name, "---");
      console.log("Changed:", changed.join(", ") || "(none)");
      console.log("Summary:", next.service_fit_summary);
      console.log("Complexity:", next.complexity_level, "| Need:", next.need_score);
    }
    console.log(`\nSample complete (${targets.length} records, ${changedCount} changed).`);
    return;
  }

  const reassessed = catalog.prospects.map((record) => reassessProspectRecord(record));
  let changedCount = 0;
  for (let i = 0; i < catalog.prospects.length; i += 1) {
    if (summarizeDiff(catalog.prospects[i], reassessed[i]).length) changedCount += 1;
  }

  if (apply) {
    const backupPath = backupCatalog(catalog);
    const nextCatalog: ProspectOutreachCatalog = {
      ...catalog,
      meta: {
        ...catalog.meta,
        methodology:
          "Service-fit reassessment (June 2026): wraparound review, workflow improvement, training, VTA-informed AI strategy, and virtual assistance — not default new-system builds.",
      },
      prospects: reassessed,
    };
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(nextCatalog, null, 2));
    console.log(`\nBackup written: ${backupPath}`);
    console.log(`Updated ${changedCount}/${catalog.prospects.length} records in catalog.json`);
  } else {
    console.log(`\nDry run: ${changedCount}/${catalog.prospects.length} records would change. Re-run with --apply to write.`);
  }
}

main();