#!/usr/bin/env python3
"""Build prospect outreach catalog: 500 charities + 500 SMBs (23 Jun 2026)."""
import csv
import io
import json
import re
import sys
import uuid
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
from prospect_filters import is_excluded_org

ROOT = SCRIPT_DIR.parent
CSV_PATH = Path.home() / "Downloads/VAxAi outreach spreadsheet - Sheet1.csv"
OUT_PATH = ROOT / "lib/engagement/prospect-outreach/catalog.json"
RESEARCH_DATE = "2026-06-23"
TARGET_CHARITY = 500
TARGET_BUSINESS = 500
TARGET_TOTAL = TARGET_CHARITY + TARGET_BUSINESS

REGION_PRIORITY = {
    "Norfolk": "primary",
    "Suffolk": "primary",
    "Cambridgeshire": "primary",
    "Greater Manchester": "secondary",
    "Merseyside": "deprioritized",
    "East of England (other)": "primary",
}


def norm_name(name: str) -> str:
    n = (name or "").lower().strip()
    n = re.sub(r"[^a-z0-9]+", " ", n)
    for drop in ("ltd", "limited", "the", "charity", "cic"):
        n = re.sub(rf"\b{drop}\b", "", n)
    return re.sub(r"\s+", " ", n).strip()


def parse_money(val: str) -> int | None:
    if not val or val.strip() in ("", "Unspecified", "#ERROR!"):
        return None
    digits = re.sub(r"[^0-9]", "", val)
    return int(digits) if digits else None


def parse_int(val: str) -> int | None:
    if not val:
        return None
    m = re.search(r"\d+", str(val).replace(",", ""))
    return int(m.group()) if m else None


def infer_region(location: str) -> str:
    loc = (location or "").lower()
    if any(x in loc for x in ("norwich", "norfolk", "great yarmouth", "king's lynn", "diss")):
        return "Norfolk"
    if any(x in loc for x in ("ipswich", "suffolk", "bury st edmunds", "lowestoft", "hadleigh", "claydon")):
        return "Suffolk"
    if any(x in loc for x in ("cambridge", "cambridgeshire", "ely", "peterborough", "huntingdon")):
        return "Cambridgeshire"
    if any(x in loc for x in ("manchester", "ancoats", "heywood", "salford", "stockport", "bolton", "oldham")):
        return "Greater Manchester"
    if "liverpool" in loc:
        return "Merseyside"
    return "East of England (other)"


def record(**kwargs) -> dict:
    region = kwargs.get("region") or infer_region(kwargs.get("location", ""))
    return {
        "id": kwargs.get("id") or str(uuid.uuid5(uuid.NAMESPACE_DNS, kwargs["organisation_name"])),
        "organisation_name": kwargs["organisation_name"],
        "organisation_type": kwargs.get("organisation_type", "Charity"),
        "location": kwargs.get("location", ""),
        "region": region,
        "website": kwargs.get("website", ""),
        "employees": kwargs.get("employees"),
        "annual_revenue_gbp": kwargs.get("annual_revenue_gbp"),
        "revenue_basis": kwargs.get("revenue_basis", ""),
        "need_score": int(kwargs.get("need_score", 4)),
        "need_rationale": kwargs.get("need_rationale", ""),
        "decision_maker_name": kwargs.get("decision_maker_name", ""),
        "decision_maker_role": kwargs.get("decision_maker_role", ""),
        "email": kwargs.get("email", ""),
        "phone": kwargs.get("phone", ""),
        "financial_source_url": kwargs.get("financial_source_url", ""),
        "contact_source_url": kwargs.get("contact_source_url", ""),
        "data_confidence": kwargs.get("data_confidence", "Medium"),
        "sector_tags": kwargs.get("sector_tags", []),
        "pain_point_tags": kwargs.get("pain_point_tags", []),
        "engagement_approach": kwargs.get("engagement_approach", ""),
        "research_date": RESEARCH_DATE,
        "priority_region": REGION_PRIORITY.get(region, "primary"),
    }


def load_csv() -> list[dict]:
    if not CSV_PATH.exists():
        return []
    rows = []
    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        lines = list(csv.reader(f))
    header_idx = next(
        (i for i, row in enumerate(lines) if row and row[0].strip() == "Organisation"),
        None,
    )
    if header_idx is None:
        return []
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerows(lines[header_idx:])
    buf.seek(0)
    reader = csv.DictReader(buf)
    for row in reader:
        org = (row.get("Organisation") or "").strip()
        if not org or org.startswith("The Big C Appeal"):
            continue
        if not row.get("needs score (1=-5)") and not row.get("Why Admin/AI support may  be valuable"):
            continue
        dm = (row.get("decision maker") or "").strip()
        role = (row.get("Roles") or "").strip()
        rows.append(record(
            organisation_name=org,
            organisation_type=(row.get("Type") or "Charity").replace("ç", "Business"),
            location=row.get("Location") or "",
            website=row.get("Website") or "",
            employees=parse_int(row.get("Employees") or ""),
            annual_revenue_gbp=parse_money(row.get("Annual/revenue") or ""),
            revenue_basis=row.get("Revenue basis/FY") or "",
            need_score=parse_int(row.get("needs score (1=-5)") or "") or 4,
            need_rationale=(row.get("Why Admin/AI support may  be valuable") or "").strip(),
            decision_maker_name=dm,
            decision_maker_role=role,
            email=(row.get("Email") or "").strip(),
            phone=(row.get("Telephone") or "").replace("#ERROR!", "").strip(),
            financial_source_url=row.get("Financial source") or "",
            contact_source_url=row.get("Leadership/Contact source") or "",
            data_confidence=(row.get("Data confidence") or "Medium").split("(")[0].strip(),
            sector_tags=[],
            pain_point_tags=[],
            engagement_approach=(row.get("Notes") or "").strip(),
        ))
    return rows


def supplemental() -> list[dict]:
    path = ROOT / "scripts/data/supplemental-prospects.json"
    if path.exists():
        return json.loads(path.read_text())
    return []


def cc_expansion() -> list[dict]:
    path = ROOT / "scripts/data/expansion-prospects-cc.json"
    if path.exists():
        return json.loads(path.read_text())
    return []


def smb_batch() -> list[dict]:
    path = ROOT / "scripts/data/smb-prospects-batch.json"
    if path.exists():
        return json.loads(path.read_text())
    return []


def merge(prospects: list[dict]) -> list[dict]:
    seen: dict[str, dict] = {}
    for p in prospects:
        if is_excluded_org(p.get("organisation_name", "")):
            continue
        key = norm_name(p["organisation_name"])
        if not key:
            continue
        if key not in seen:
            seen[key] = p
            continue
        cur = seen[key]
        for field in p:
            if field == "id":
                continue
            if not cur.get(field) and p.get(field):
                cur[field] = p[field]
            elif field == "need_score" and (p.get(field) or 0) > (cur.get(field) or 0):
                cur[field] = p[field]
    return sorted(seen.values(), key=lambda x: (-x.get("need_score", 0), x.get("region", ""), x.get("organisation_name", "")))


def is_charity_segment(prospect: dict) -> bool:
    org_type = prospect.get("organisation_type", "Charity")
    return (
        org_type == "Charity"
        or str(org_type).startswith("Charity")
        or org_type == "Social enterprise"
    )


def build_charity_batch() -> list[dict]:
    curated = [p for p in load_csv() + supplemental() if not is_excluded_org(p.get("organisation_name", ""))]
    expansion = [p for p in cc_expansion() if not is_excluded_org(p.get("organisation_name", ""))]
    charity: list[dict] = []
    seen: set[str] = set()

    for p in merge(curated + expansion):
        if not is_charity_segment(p):
            continue
        key = norm_name(p["organisation_name"])
        if key in seen:
            continue
        charity.append(p)
        seen.add(key)

    if len(charity) < TARGET_CHARITY:
        for p in sorted(expansion, key=lambda x: (-x.get("need_score", 0), x.get("organisation_name", ""))):
            if len(charity) >= TARGET_CHARITY:
                break
            key = norm_name(p["organisation_name"])
            if key in seen:
                continue
            charity.append(p)
            seen.add(key)

    return charity[:TARGET_CHARITY]


def build_business_batch(charity_names: set[str]) -> list[dict]:
    business: list[dict] = []
    seen: set[str] = set()
    for p in merge([p for p in smb_batch() if not is_excluded_org(p.get("organisation_name", ""))]):
        key = norm_name(p["organisation_name"])
        if key in charity_names or key in seen:
            continue
        business.append(p)
        seen.add(key)
    return business[:TARGET_BUSINESS]


def stats(prospects: list[dict]) -> tuple[dict[str, int], dict[str, int], dict[str, int]]:
    by_region: dict[str, int] = {}
    by_score: dict[str, int] = {}
    by_type: dict[str, int] = {}
    for p in prospects:
        by_region[p["region"]] = by_region.get(p["region"], 0) + 1
        by_score[str(p["need_score"])] = by_score.get(str(p["need_score"]), 0) + 1
        org_type = p.get("organisation_type", "Other")
        by_type[org_type] = by_type.get(org_type, 0) + 1
    return by_region, by_score, by_type


def main():
    charity = build_charity_batch()
    charity_names = {norm_name(p["organisation_name"]) for p in charity}
    business = build_business_batch(charity_names)
    prospects = charity + business
    by_region, by_score, by_type = stats(prospects)

    catalog = {
        "meta": {
            "research_date": RESEARCH_DATE,
            "total_count": len(prospects),
            "target_total": TARGET_TOTAL,
            "target_charity_total": TARGET_CHARITY,
            "target_business_total": TARGET_BUSINESS,
            "charity_count": len(charity),
            "business_count": len(business),
            "by_region": by_region,
            "by_need_score": by_score,
            "by_organisation_type": by_type,
            "methodology": (
                "Two segments: (1) 500 charities from Charity Commission open data and curated regional research; "
                "(2) 500 SMBs/non-charities across 17 sectors with admin-burden and AI-adoption intelligence for meeting prep. "
                "Regions: Norfolk, Suffolk, Cambridgeshire (primary), Greater Manchester (secondary). "
                "SMB scoring weights automation/AI training fit, sector admin pressure, and notes where VA alone is not the right entry. "
                f"Research date 23 Jun 2026."
            ),
        },
        "prospects": prospects,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(prospects)} prospects ({len(charity)} charity + {len(business)} business) to {OUT_PATH}")
    print("By region:", by_region)
    print("By type:", by_type)


if __name__ == "__main__":
    main()