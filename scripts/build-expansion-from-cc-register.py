#!/usr/bin/env python3
"""Expand prospect outreach catalog toward 500 using Charity Commission open data."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
from prospect_filters import EXCLUDE_NAME_RE, is_excluded_org

ROOT = SCRIPT_DIR.parent
CACHE = SCRIPT_DIR / ".cache/cc-data"
OUT_PATH = SCRIPT_DIR / "data/expansion-prospects-cc.json"
CATALOG_PATH = ROOT / "lib/engagement/prospect-outreach/catalog.json"
TARGET_TOTAL = 500
# Buffer for merge dedupes and non-charity rows in curated CSV/supplemental
REGION_QUOTA_BUFFER = 20
RESEARCH_DATE = "2026-06-23"

_spec = importlib.util.spec_from_file_location(
    "build_prospect_catalog",
    SCRIPT_DIR / "build-prospect-catalog.py",
)
_catalog = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_catalog)
record = _catalog.record
norm_name = _catalog.norm_name

AREA_TO_REGION: dict[str, str] = {
    "Norfolk": "Norfolk",
    "Suffolk": "Suffolk",
    "Cambridgeshire": "Cambridgeshire",
    "Peterborough City": "Cambridgeshire",
    "Manchester City": "Greater Manchester",
    "Salford City": "Greater Manchester",
    "Trafford": "Greater Manchester",
    "Stockport": "Greater Manchester",
    "Bolton": "Greater Manchester",
    "Oldham": "Greater Manchester",
    "Bury": "Greater Manchester",
    "Tameside": "Greater Manchester",
    "Rochdale": "Greater Manchester",
    "Wigan": "Greater Manchester",
    "Liverpool City": "Merseyside",
}

REGION_QUOTAS = {
    "Norfolk": 125,
    "Suffolk": 122,
    "Cambridgeshire": 131,
    "Greater Manchester": 109,
    "Merseyside": 13,
}

PAIN_KEYWORDS: list[tuple[str, list[str], str]] = [
    ("housing", ["housing", "homeless", "accommodation", "shelter", "tenancy"], "Housing and homelessness services create tenancy, referral and contract-reporting administration."),
    ("care", ["care", "carer", "dementia", "disability", "supported living"], "Care and supported living programmes require care plans, rotas, safeguarding and funder evidence."),
    ("children", ["children", "young people", "youth", "family", "nursery"], "Children and family services span casework, safeguarding, referrals and programme reporting."),
    ("health", ["health", "mental health", "wellbeing", "counselling", "hospice"], "Health and wellbeing delivery needs appointment coordination, clinical liaison and case records."),
    ("advice", ["advice", "information", "advocacy", "citizens advice"], "Advice services handle high-volume enquiries, case notes and referral tracking."),
    ("community", ["community", "volunteer", "education", "training", "employment"], "Community programmes involve volunteers, bookings, training registers and partner reporting."),
    ("arts", ["arts", "culture", "heritage", "museum"], "Arts and community delivery needs event scheduling, participant admin and grant reporting."),
]


def cc_url(charity_number: int | str) -> str:
    return (
        "https://register-of-charities.charitycommission.gov.uk/en/charity-search/"
        f"-/charity-details/{charity_number}/full-print"
    )


def infer_location(row: dict, region: str) -> str:
    parts = [
        row.get("charity_contact_address3"),
        row.get("charity_contact_address4"),
        row.get("charity_contact_postcode"),
    ]
    locality = ", ".join(p.strip() for p in parts if p and str(p).strip())
    return f"{locality}, {region}" if locality else region


def infer_tags_and_rationale(activities: str | None) -> tuple[list[str], list[str], str, int]:
    text = (activities or "").lower()
    sector_tags: list[str] = []
    pain_tags: list[str] = []
    rationales: list[str] = []
    score = 3

    for tag, keywords, rationale in PAIN_KEYWORDS:
        if any(k in text for k in keywords):
            sector_tags.append(tag)
            pain_tags.append(keywords[0].replace(" ", "_"))
            rationales.append(rationale)

    if not rationales:
        rationales.append(
            "Registered charity with multi-programme delivery — likely admin load across casework, reporting and coordination."
        )
        sector_tags.append("community")

    if any(k in text for k in ("homeless", "safeguarding", "care", "mental health", "refugee", "domestic")):
        score = 5
    elif len(rationales) >= 2 or any(k in text for k in ("housing", "children", "advice", "disability")):
        score = 4

    return sector_tags[:3], pain_tags[:3], " ".join(rationales[:2]), score


def estimate_employees(income: int | None) -> int | None:
    if not income:
        return None
    if income < 500_000:
        return None
    if income < 1_000_000:
        return 12
    if income < 2_500_000:
        return 25
    if income < 5_000_000:
        return 45
    if income < 10_000_000:
        return 70
    return 95


def load_curated_prospects() -> list[dict]:
    """Hand-researched CSV + supplemental batch — never CC expansion."""
    rows = _catalog.load_csv() + _catalog.supplemental()
    return [p for p in rows if not is_excluded_org(p.get("organisation_name", ""))]


def load_existing_names() -> set[str]:
    return {norm_name(p["organisation_name"]) for p in load_curated_prospects() if p.get("organisation_name")}


def curated_region_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    for p in load_curated_prospects():
        region = p.get("region", "")
        counts[region] = counts.get(region, 0) + 1
    return counts


def load_charities() -> list[dict]:
    path = CACHE / "publicextract.charity.json"
    with path.open(encoding="utf-8-sig") as f:
        return json.load(f)


def load_area_map() -> dict[int, set[str]]:
    path = CACHE / "publicextract.charity_area_of_operation.json"
    with path.open(encoding="utf-8-sig") as f:
        rows = json.load(f)
    mapping: dict[int, set[str]] = {}
    for row in rows:
        area = row.get("geographic_area_description")
        region = AREA_TO_REGION.get(area or "")
        if not region:
            continue
        org = int(row["organisation_number"])
        mapping.setdefault(org, set()).add(region)
    return mapping


def charity_to_prospect(row: dict, region: str) -> dict:
    income = row.get("latest_income")
    income_int = int(income) if income else None
    sector_tags, pain_tags, rationale, need_score = infer_tags_and_rationale(row.get("charity_activities"))
    website = (row.get("charity_contact_web") or "").strip()
    if website and not website.startswith("http"):
        website = f"https://{website}"

    fy_end = row.get("latest_acc_fin_period_end_date")
    revenue_basis = f"FY ending {str(fy_end)[:10]}; Charity Commission latest income" if fy_end else "Charity Commission latest income"

    return record(
        organisation_name=row["charity_name"].strip(),
        organisation_type="Charity",
        location=infer_location(row, region),
        region=region,
        website=website,
        employees=estimate_employees(income_int),
        annual_revenue_gbp=income_int,
        revenue_basis=revenue_basis,
        need_score=need_score,
        need_rationale=rationale,
        decision_maker_name="",
        decision_maker_role="Chief Executive",
        email=(row.get("charity_contact_email") or "").strip(),
        phone=(row.get("charity_contact_phone") or "").strip(),
        financial_source_url=cc_url(row["registered_charity_number"]),
        contact_source_url=website or cc_url(row["registered_charity_number"]),
        data_confidence="Medium" if row.get("charity_contact_email") else "Low",
        sector_tags=sector_tags,
        pain_point_tags=pain_tags,
        engagement_approach="Charity Commission register expansion batch — validate contact and programme fit before outreach.",
    )


def main() -> None:
    existing = load_existing_names()
    area_map = load_area_map()
    charities = load_charities()

    candidates: dict[str, list[tuple[int, dict]]] = {r: [] for r in REGION_QUOTAS}

    for row in charities:
        if row.get("charity_registration_status") != "Registered":
            continue
        income = row.get("latest_income")
        if not income or int(income) < 500_000:
            continue
        if int(income) > 15_000_000:
            continue

        charity_name = row.get("charity_name", "")
        if is_excluded_org(charity_name):
            continue

        name_key = norm_name(charity_name)
        if not name_key or name_key in existing:
            continue

        org = int(row["organisation_number"])
        regions = area_map.get(org)
        if not regions:
            continue

        income_score = int(income)
        has_contact = 1 if row.get("charity_contact_email") else 0
        has_web = 1 if row.get("charity_contact_web") else 0
        rank = (has_contact, has_web, income_score)

        for region in regions:
            candidates[region].append((rank, row))

    selected: list[dict] = []
    selected_names: set[str] = set()

    curated = load_curated_prospects()
    current_count = len(curated)
    needed = max(0, TARGET_TOTAL - current_count)
    curated_regions = curated_region_counts()

    for region, quota in REGION_QUOTAS.items():
        current_region = curated_regions.get(region, 0)
        region_need = max(0, quota - current_region) + (REGION_QUOTA_BUFFER if region != "Merseyside" else 1)
        if region_need <= 0:
            continue

        pool = sorted(candidates.get(region, []), key=lambda x: x[0], reverse=True)
        added = 0
        for _, row in pool:
            if added >= region_need or len(selected) >= needed + REGION_QUOTA_BUFFER:
                break
            key = norm_name(row["charity_name"])
            if key in existing or key in selected_names:
                continue
            selected.append(charity_to_prospect(row, region))
            selected_names.add(key)
            added += 1

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(selected, indent=2, ensure_ascii=False) + "\n")

    by_region: dict[str, int] = {}
    for p in selected:
        by_region[p["region"]] = by_region.get(p["region"], 0) + 1

    print(f"Current catalog: {current_count}")
    print(f"Selected expansion: {len(selected)} (target add up to {needed})")
    print("By region:", by_region)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()