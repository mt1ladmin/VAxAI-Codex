#!/usr/bin/env python3
"""Build 500 SMB/non-charity prospects with sector intelligence for meeting prep."""
from __future__ import annotations

import importlib.util
import json
import sys
import uuid
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from prospect_filters import is_excluded_org

RESEARCH_PATH = SCRIPT_DIR / "data/smb-sector-research.json"
OUT_PATH = SCRIPT_DIR / "data/smb-prospects-batch.json"
CATALOG_PATH = ROOT / "lib/engagement/prospect-outreach/catalog.json"
RESEARCH_DATE = "2026-06-23"
TARGET_SMB = 500

REGION_QUOTAS = {
    "Norfolk": 125,
    "Suffolk": 125,
    "Cambridgeshire": 125,
    "Greater Manchester": 125,
}

PRIMARY_BASE_SCORE = {
    "automation": 5,
    "ai_training": 4,
    "blend": 4,
    "va": 3,
}

PRIMARY_LABEL = {
    "automation": "Workflow automation (primary)",
    "ai_training": "AI training & adoption (primary)",
    "blend": "Blend: AI training + automation + selective VA",
    "va": "Virtual assistance (primary)",
}

_spec = importlib.util.spec_from_file_location(
    "build_prospect_catalog",
    SCRIPT_DIR / "build-prospect-catalog.py",
)
_catalog = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_catalog)
record = _catalog.record
norm_name = _catalog.norm_name


def load_existing_names() -> set[str]:
    names: set[str] = set()
    if CATALOG_PATH.exists():
        for p in json.loads(CATALOG_PATH.read_text()).get("prospects", []):
            names.add(norm_name(p.get("organisation_name", "")))
    return {n for n in names if n}


def score_company(sector: dict, company: dict) -> int:
    fit = sector.get("vaxai_fit", {})
    primary = fit.get("primary", "blend")
    score = PRIMARY_BASE_SCORE.get(primary, 4)

    employees = company.get("employees_est") or 0
    revenue = company.get("revenue_est_gbp") or 0

    # Sweet spot: SMB with enough admin volume but not enterprise IT teams
    if 10 <= employees <= 80:
        score += 1
    if 500_000 <= revenue <= 8_000_000:
        score += 0  # already in target band
    if revenue > 15_000_000:
        score -= 1
    if employees < 5:
        score -= 1

    admin = (sector.get("admin_burden") or "").lower()
    if any(k in admin for k in ("compliance", "regulated", "high-volume", "reporting", "scheduling")):
        score += 0  # already reflected in sector

    return max(2, min(5, score))


def pain_tags_for_sector(sector_key: str, primary: str) -> list[str]:
    tags = [sector_key.replace("_", "-")]
    if primary in ("ai_training", "blend"):
        tags.append("ai-training")
    if primary in ("automation", "blend"):
        tags.append("automation")
    if primary == "va":
        tags.append("virtual-assistance")
    tags.append("admin-burden")
    return tags


def build_need_rationale(sector: dict, company: dict) -> str:
    name = company["name"]
    town = company.get("town", "")
    sector_label = sector["sector_label"]
    admin = sector["admin_burden"]
    ai_notes = sector["ai_adoption_notes"]

    size_note = ""
    if company.get("employees_est"):
        size_note = f"Estimated ~{company['employees_est']} employees"
    if company.get("revenue_est_gbp"):
        rev = company["revenue_est_gbp"]
        size_note += f" · turnover est. £{rev:,}" if size_note else f"Turnover est. £{rev:,}"

    return (
        f"{name} ({town}) — {sector_label}. {admin} "
        f"{size_note + '. ' if size_note else ''}"
        f"AI/adoption context: {ai_notes}"
    )


def build_engagement_approach(sector: dict, company: dict) -> str:
    fit = sector.get("vaxai_fit", {})
    primary = fit.get("primary", "blend")
    hooks = fit.get("meeting_hooks") or []
    va_note = fit.get("va_less_suitable_when", "")

    lines = [
        f"MEETING PREP — {company['name']} ({sector['sector_label']})",
        "",
        f"RECOMMENDED VAxAI ENTRY: {PRIMARY_LABEL.get(primary, primary)}",
        "",
        "WHY ADMIN / AI PRESSURE IS HIGH:",
        sector["admin_burden"],
        "",
        "UK AI ADOPTION (use in conversation):",
        sector["ai_adoption_notes"],
        "",
    ]

    if va_note:
        lines.extend([
            "WHERE VA ALONE IS NOT THE RIGHT LEAD:",
            va_note,
            "",
        ])

    if hooks:
        lines.append("SUGGESTED CALL HOOKS / DISCOVERY QUESTIONS:")
        for h in hooks:
            lines.append(f"• {h}")
        lines.append("")

    lines.extend([
        "DISCOVERY PROMPTS FOR THIS CALL:",
        f"• How much time does the team spend on the highest-volume admin tasks in {sector['sector_label'].lower()}?",
        "• Have they piloted AI tools internally, or only client-facing tech?",
        "• Who owns operations/process improvement — and is AI training on anyone's KPIs?",
        "• What would 'win' look like in 90 days: hours saved, fewer errors, or staff confident using AI?",
        "",
        "NOTES:",
        "Revenue/employee figures are estimates for sizing only — confirm on Companies House before quoting.",
        f"Research date: {RESEARCH_DATE}. Validate website and decision-maker before outreach.",
    ])
    return "\n".join(lines)


def company_to_prospect(sector: dict, company: dict) -> dict:
    region = company.get("region") or "East of England (other)"
    town = company.get("town", "")
    location = f"{town}, {region}" if town else region
    website = (company.get("website") or "").strip()
    primary = sector.get("vaxai_fit", {}).get("primary", "blend")
    need_score = score_company(sector, company)

    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"smb:{company['name']}:{town}"))

    return record(
        id=stable_id,
        organisation_name=company["name"],
        organisation_type="Business",
        location=location,
        region=region,
        website=website,
        employees=company.get("employees_est"),
        annual_revenue_gbp=company.get("revenue_est_gbp"),
        revenue_basis="Estimated turnover band for SMB sizing (verify via Companies House accounts)",
        need_score=need_score,
        need_rationale=build_need_rationale(sector, company),
        decision_maker_name="",
        decision_maker_role="Managing Director / Operations Director",
        email="",
        phone="",
        financial_source_url=(
            f"https://find-and-update.company-information.service.gov.uk/search/companies?q="
            f"{company['name'].replace(' ', '+')}"
        ),
        contact_source_url=website or "",
        data_confidence="Medium",
        sector_tags=[sector["sector_label"], sector["sector_key"]],
        pain_point_tags=pain_tags_for_sector(sector["sector_key"], primary),
        engagement_approach=build_engagement_approach(sector, company),
    )


def select_prospects(candidates: list[tuple[int, dict]]) -> list[dict]:
    """Pick up to TARGET_SMB with regional quotas and sector diversity."""
    by_region: dict[str, list[tuple[int, dict]]] = {}
    for rank, prospect in candidates:
        region = prospect["region"]
        by_region.setdefault(region, []).append((rank, prospect))

    for region in by_region:
        by_region[region].sort(key=lambda x: x[0], reverse=True)

    selected: list[dict] = []
    selected_names: set[str] = set()
    sector_counts: dict[str, int] = {}

    # Round-robin across regions, preferring high scores and sector diversity
    regions = list(REGION_QUOTAS.keys())
    quotas = {r: REGION_QUOTAS[r] for r in regions}
    pointers = {r: 0 for r in regions}
    max_sector_per_region = 18  # avoid one sector dominating

    while len(selected) < TARGET_SMB and any(quotas[r] > 0 for r in regions):
        progressed = False
        for region in regions:
            if quotas[region] <= 0:
                continue
            pool = by_region.get(region, [])
            while pointers[region] < len(pool):
                _, prospect = pool[pointers[region]]
                pointers[region] += 1
                key = norm_name(prospect["organisation_name"])
                sector_key = prospect["sector_tags"][-1] if prospect["sector_tags"] else "other"
                region_sector_key = f"{region}:{sector_key}"
                if key in selected_names:
                    continue
                if sector_counts.get(region_sector_key, 0) >= max_sector_per_region:
                    continue
                selected.append(prospect)
                selected_names.add(key)
                sector_counts[region_sector_key] = sector_counts.get(region_sector_key, 0) + 1
                quotas[region] -= 1
                progressed = True
                break
        if not progressed:
            break

    return selected


def main() -> None:
    if not RESEARCH_PATH.exists():
        raise SystemExit(f"Missing {RESEARCH_PATH}")

    sectors = json.loads(RESEARCH_PATH.read_text())
    existing = load_existing_names()
    candidates: list[tuple[int, dict]] = []

    for sector in sectors:
        for company in sector.get("companies", []):
            name = company.get("name", "").strip()
            if not name or is_excluded_org(name):
                continue
            key = norm_name(name)
            if key in existing:
                continue
            prospect = company_to_prospect(sector, company)
            rank = (prospect["need_score"], prospect.get("annual_revenue_gbp") or 0)
            candidates.append((rank, prospect))

    selected = select_prospects(candidates)

    # If under target, fill from remaining high-score pool without sector cap
    if len(selected) < TARGET_SMB:
        selected_names = {norm_name(p["organisation_name"]) for p in selected}
        remaining = sorted(candidates, key=lambda x: x[0], reverse=True)
        for _, prospect in remaining:
            if len(selected) >= TARGET_SMB:
                break
            key = norm_name(prospect["organisation_name"])
            if key in selected_names:
                continue
            selected.append(prospect)
            selected_names.add(key)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(selected, indent=2, ensure_ascii=False) + "\n")

    by_region: dict[str, int] = {}
    by_score: dict[str, int] = {}
    for p in selected:
        by_region[p["region"]] = by_region.get(p["region"], 0) + 1
        by_score[str(p["need_score"])] = by_score.get(str(p["need_score"]), 0) + 1

    print(f"Wrote {len(selected)} SMB prospects to {OUT_PATH}")
    print("By region:", by_region)
    print("By need score:", by_score)


if __name__ == "__main__":
    main()