#!/usr/bin/env python3
"""Enrich Prospect Finder catalog records with org-specific research.

Builds on existing catalog data, Charity Commission open data, website snippets,
and SMB sector intelligence. Preserves useful MEETING PREP content for businesses.

Usage:
  python3 scripts/enrich-prospect-research.py --dry-run --start=0 --limit=5
  python3 scripts/enrich-prospect-research.py --apply --start=0 --limit=100
  python3 scripts/enrich-prospect-research.py --apply --all --skip-web
"""
from __future__ import annotations

import argparse
import json
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = ROOT / "lib/engagement/prospect-outreach/catalog.json"
CC_CACHE = Path(__file__).resolve().parent / ".cache/cc-data/publicextract.charity.json"
CHARITY_INTEL_PATH = Path(__file__).resolve().parent / "data/charity-sector-intelligence.json"
SMB_INTEL_PATH = Path.home() / "vaxai_smb_research_june2026.json"
RESEARCH_DATE = date.today().isoformat()

VAXAI_CORE = [
    "Existing-system and workflow review",
    "AI and automation opportunity assessment",
    "AI readiness and practical upskilling",
    "Team training and workshops",
    "VAT-informed AI strategy and decision support",
    "AI guidance and policy development",
    "Ongoing or ad hoc virtual assistance",
    "Support managing existing systems and processes",
]
VAXAI_PARTIAL = [
    "Lightweight process automation within existing tools",
    "Connecting or simplifying data flows between familiar systems",
    "Piloting AI-assisted drafting with human review",
    "Coordinating follow-up across teams and suppliers",
]
PARTNER = [
    "Complex bespoke system build or replacement",
    "Enterprise integration or data platform work",
    "Specialist accessibility engineering beyond process design",
    "Highly regulated technical implementation requiring certified specialists",
]

ENTRY_MAP = {
    "workflow automation": ["AI and automation opportunity assessment", "Existing-system and workflow review", "Team training and workshops"],
    "blend": ["AI readiness and practical upskilling", "AI and automation opportunity assessment", "Ongoing or ad hoc virtual assistance"],
    "training": ["Team training and workshops", "AI readiness and practical upskilling", "VAT-informed AI strategy and decision support"],
    "va": ["Ongoing or ad hoc virtual assistance", "Support managing existing systems and processes"],
    "policy": ["AI guidance and policy development", "VAT-informed AI strategy and decision support", "Team training and workshops"],
}


def norm_name(name: str) -> str:
    n = (name or "").lower().strip()
    n = re.sub(r"[^a-z0-9]+", " ", n)
    for drop in ("ltd", "limited", "the", "charity", "cic", "trust"):
        n = re.sub(rf"\b{drop}\b", "", n)
    return re.sub(r"\s+", " ", n).strip()


def parse_charity_number(url: str) -> str | None:
    if not url:
        return None
    m = re.search(r"charity-details/(\d+)", url)
    return m.group(1) if m else None


def load_cc_index() -> tuple[dict[str, dict], dict[str, dict]]:
    by_name: dict[str, dict] = {}
    by_number: dict[str, dict] = {}
    if not CC_CACHE.exists():
        return by_name, by_number
    with CC_CACHE.open(encoding="utf-8-sig") as f:
        rows = json.load(f)
    for row in rows:
        name = norm_name(row.get("charity_name") or "")
        num = str(row.get("registered_charity_number") or "")
        if name:
            by_name[name] = row
        if num:
            by_number[num] = row
    return by_name, by_number


def load_charity_intel() -> dict[str, dict]:
    if not CHARITY_INTEL_PATH.exists():
        return {}
    data = json.loads(CHARITY_INTEL_PATH.read_text())
    return {item["sector_key"]: item for item in data}


def load_smb_intel() -> dict[str, dict]:
    if not SMB_INTEL_PATH.exists():
        alt = Path(__file__).resolve().parent / "data/smb-sector-research.json"
        if not alt.exists():
            return {}
        data = json.loads(alt.read_text())
    else:
        data = json.loads(SMB_INTEL_PATH.read_text())
    out: dict[str, dict] = {}
    for item in data:
        out[item["sector_key"]] = item
        out[norm_name(item["sector_label"])] = item
    return out


def fetch_website_snippet(url: str, timeout: float = 6.0) -> str:
    if not url:
        return ""
    if not url.startswith("http"):
        url = f"https://{url}"
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "VAxAI-ProspectResearch/1.0 (+research enrichment)"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            html = resp.read(120_000).decode("utf-8", errors="ignore")
    except (urllib.error.URLError, TimeoutError, ValueError):
        return ""

    title = ""
    m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.I)
    if m:
        title = unescape(m.group(1)).strip()

    desc = ""
    for pat in (
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)',
    ):
        m = re.search(pat, html, re.I)
        if m:
            desc = unescape(m.group(1)).strip()
            break

    parts = [p for p in (title, desc) if p]
    return " — ".join(parts)[:400]


def parse_meeting_prep(text: str) -> dict[str, str]:
    if not text or "MEETING PREP" not in text:
        return {}
    headers = [
        "RECOMMENDED VAxAI ENTRY",
        "WHY ADMIN / AI PRESSURE IS HIGH",
        "UK AI ADOPTION (use in conversation)",
        "WHERE VA ALONE IS NOT THE RIGHT LEAD",
        "SUGGESTED CALL HOOKS / DISCOVERY QUESTIONS",
        "DISCOVERY PROMPTS FOR THIS CALL",
        "NOTES",
        "RECOMMENDED NEXT ACTION",
        "WHAT THE ORGANISATION DOES",
        "STRONGEST REASON TO CONTACT",
        "HOW TO PRESENT VAxAI",
    ]
    sections: dict[str, str] = {}
    current = "_header"
    lines: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        matched = None
        for h in headers:
            if line.upper().startswith(h.upper() + ":"):
                if lines:
                    sections[current] = "\n".join(lines).strip()
                current = h
                rest = line.split(":", 1)[1].strip()
                lines = [rest] if rest else []
                matched = True
                break
        if matched:
            continue
        if line.startswith("•"):
            lines.append(line)
        elif line:
            lines.append(line)
    if lines:
        sections[current] = "\n".join(lines).strip()
    return sections


def match_charity_sector(sector_tags: list[str], activities: str) -> dict | None:
    intel = load_charity_intel()
    text = f"{' '.join(sector_tags)} {activities}".lower()
    priority = [
        ("housing", ["housing", "homeless", "accommodation", "tenancy", "shelter"]),
        ("care", ["care", "carer", "dementia", "disability", "supported living"]),
        ("children", ["children", "young people", "youth", "family", "nursery"]),
        ("health", ["health", "mental health", "wellbeing", "counselling", "hospice"]),
        ("advice", ["advice", "information", "advocacy", "citizens advice"]),
        ("legal", ["legal", "law", "justice", "probation"]),
        ("disability", ["disability", "autism", "learning disability", "neurodiver"]),
        ("environment", ["environment", "conservation", "wildlife", "climate"]),
        ("arts", ["arts", "culture", "heritage", "museum"]),
        ("community", ["community", "volunteer", "education", "training", "employment"]),
    ]
    for key, kws in priority:
        if any(k in text for k in kws):
            return intel.get(key)
    return intel.get("community")


def match_smb_sector(sector_tags: list[str]) -> dict | None:
    intel = load_smb_intel()
    for tag in sector_tags:
        key = norm_name(tag.split("(")[0])
        for candidate in (tag.lower(), key, key.replace(" ", "_")):
            if candidate in intel:
                return intel[candidate]
        for item_key, item in intel.items():
            if key and key in norm_name(item.get("sector_label", "")):
                return item
    return None


def infer_complexity(employees: int | None, revenue: int | None, org_type: str) -> str:
    headcount = employees or 0
    rev = revenue or 0
    if headcount >= 150 or rev >= 15_000_000:
        return "Very high"
    if headcount >= 50 or rev >= 5_000_000:
        return "High"
    if headcount >= 15 or rev >= 1_000_000:
        return "Moderate"
    return "Low"


def pick_support(entry: str, sector_intel: dict | None, is_charity: bool) -> tuple[list[str], list[str], list[str]]:
    entry_l = (entry or "").lower()
    direct: list[str] = []
    if "workflow" in entry_l or "automation" in entry_l:
        direct.extend(ENTRY_MAP["workflow automation"])
    if "blend" in entry_l:
        direct.extend(ENTRY_MAP["blend"])
    if "training" in entry_l:
        direct.extend(ENTRY_MAP["training"])
    if "policy" in entry_l:
        direct.extend(ENTRY_MAP["policy"])
    if re.search(r"\bva\b", entry_l) or "virtual assistance" in entry_l:
        direct.extend(ENTRY_MAP["va"])
    if not direct and sector_intel:
        primary = (sector_intel.get("vaxai_fit") or {}).get("primary", "").lower()
        for token, offers in ENTRY_MAP.items():
            if token in primary:
                direct.extend(offers)
    if not direct:
        direct = VAXAI_CORE[:4]
    direct = list(dict.fromkeys(direct))[:5]

    partial = VAXAI_PARTIAL[:2]
    partner: list[str] = []
    if any(w in entry_l for w in ("automation", "workflow", "integration")):
        partner.append(PARTNER[1])
    if is_charity and sector_intel and sector_intel.get("sector_key") in ("care", "health", "legal"):
        partner.append(PARTNER[3])
    if not partner:
        partner = [PARTNER[2]]
    return direct, partial, partner[:3]


def build_evidence_block(record: dict, cc: dict | None, web: str, sections: dict[str, str]) -> str:
    verified: list[str] = []
    interpreted: list[str] = []
    to_confirm: list[str] = []

    if cc:
        acts = (cc.get("charity_activities") or "").strip()
        if acts:
            verified.append(f"Charity Commission activities: {acts[:320]}")
        income = cc.get("latest_income")
        if income:
            verified.append(f"Latest reported income £{int(income):,} (Charity Commission).")
        email = cc.get("charity_contact_email")
        phone = cc.get("charity_contact_phone")
        if email:
            verified.append(f"Registered contact email: {email}.")
        if phone:
            verified.append(f"Registered phone: {phone}.")
    elif record.get("financial_source_url"):
        verified.append(f"Financial source on file: {record['financial_source_url']}")

    if record.get("employees"):
        verified.append(f"Headcount on record: ~{record['employees']} employees.")
    if record.get("annual_revenue_gbp"):
        verified.append(
            f"Income/turnover on record: £{record['annual_revenue_gbp']:,} ({record.get('revenue_basis') or 'basis not stated'})."
        )

    if web:
        verified.append(f"Website summary: {web}")

    admin = sections.get("WHY ADMIN / AI PRESSURE IS HIGH") or record.get("need_rationale", "")
    if admin:
        interpreted.append(f"Admin/workflow pressure signals: {admin[:350]}")

    if record.get("sector_tags"):
        interpreted.append(f"Sector tags: {', '.join(record['sector_tags'])}.")

    if not record.get("decision_maker_name"):
        to_confirm.append("Confirm named decision-maker and whether they own operations or digital improvement.")
    if record.get("data_confidence") != "High":
        to_confirm.append("Validate contact route and programme fit before outreach.")
    if record.get("organisation_type") == "Business" and not record.get("email"):
        to_confirm.append("Identify direct email for operations or office manager.")
    if record.get("organisation_type", "").startswith("Charity") and cc is None:
        to_confirm.append("Cross-check Charity Commission register for latest activities and trustees.")

    parts = []
    if verified:
        parts.append("VERIFIED:\n- " + "\n- ".join(verified))
    if interpreted:
        parts.append("INTERPRETED:\n- " + "\n- ".join(interpreted))
    if to_confirm:
        parts.append("TO CONFIRM:\n- " + "\n- ".join(to_confirm))
    return "\n\n".join(parts)[:1800]


def build_open_questions(record: dict, sections: dict[str, str], sector_intel: dict | None) -> list[str]:
    prompts = sections.get("DISCOVERY PROMPTS FOR THIS CALL") or sections.get(
        "SUGGESTED CALL HOOKS / DISCOVERY QUESTIONS", ""
    )
    questions = [re.sub(r"^[•\-]\s*", "", q.strip()) for q in prompts.splitlines() if q.strip()]
    questions = [q for q in questions if len(q) > 12][:4]
    if len(questions) < 3:
        questions.extend(
            [
                f"Which systems and workflows create the most daily admin pressure for {record['organisation_name']}?",
                "Who owns process improvement, reporting, and any AI exploration internally?",
                "What would a useful 90-day outcome look like — hours saved, fewer errors, or staff confident using AI safely?",
            ]
        )
    if sector_intel:
        hooks = (sector_intel.get("vaxai_fit") or {}).get("meeting_hooks") or []
        for h in hooks[:2]:
            if h not in questions:
                questions.append(h)
    return list(dict.fromkeys(questions))[:5]


def recommended_next_action(record: dict, sections: dict[str, str], is_charity: bool) -> str:
    if sections.get("RECOMMENDED NEXT ACTION"):
        return sections["RECOMMENDED NEXT ACTION"][:280]
    contact = record.get("email") or record.get("phone") or "website contact form"
    sector = (record.get("sector_tags") or ["their sector"])[0]
    if is_charity:
        return (
            f"Send a short, sector-specific note to {contact} referencing {sector.lower()} admin load "
            f"and offer a 30-minute workflow review — not a platform pitch."
        )
    return (
        f"Email or call {contact} with one sector-specific hook from the research and propose a "
        f"30-minute discovery call focused on existing tools and admin pinch points."
    )


def build_recommended_engagement(record: dict, sections: dict[str, str], sector_intel: dict | None, is_charity: bool) -> str:
    entry = sections.get("RECOMMENDED VAxAI ENTRY", "")
    hooks = sections.get("SUGGESTED CALL HOOKS / DISCOVERY QUESTIONS", "")
    va_note = sections.get("WHERE VA ALONE IS NOT THE RIGHT LEAD", "")
    org = record["organisation_name"]
    sector = (record.get("sector_tags") or [record.get("organisation_type", "")])[0]

    opener = (
        f"Open with a brief note to {org} acknowledging their {sector.lower()} operating context "
        f"and the admin pressure described in research — avoid leading with a new system."
    )
    if entry:
        core = f"Lead with {entry.strip()} framed as wraparound support around existing tools."
    elif sector_intel:
        core = f"Lead with {(sector_intel.get('vaxai_fit') or {}).get('primary', 'workflow review and training')}."
    else:
        core = "Lead with an existing-system and workflow review, then practical AI training where appropriate."

    if va_note:
        core += f" {va_note.strip()}"
    elif sector_intel and (sector_intel.get("vaxai_fit") or {}).get("va_less_suitable_when"):
        core += f" {(sector_intel['vaxai_fit']['va_less_suitable_when']).strip()}"

    close = recommended_next_action(record, sections, is_charity)
    return f"{opener} {core} Next action: {close}"[:900]


def build_charity_meeting_prep(record: dict, cc: dict | None, web: str, sector_intel: dict | None) -> str:
    org = record["organisation_name"]
    sector = (record.get("sector_tags") or ["community"])[0]
    sector_label = (sector_intel or {}).get("sector_label", sector.replace("_", " ").title())

    what = ""
    if cc and cc.get("charity_activities"):
        what = cc["charity_activities"].strip()
    elif web:
        what = web
    elif record.get("need_rationale"):
        what = record["need_rationale"]
    else:
        what = "Registered charity — programme detail to be confirmed from website and annual report."

    admin = record.get("need_rationale") or (sector_intel or {}).get("admin_burden", "")
    ai_notes = (sector_intel or {}).get("charity_ai_notes", "")
    primary = (sector_intel or {}).get("vaxai_fit", {}).get("primary", "Workflow review + training")
    va_less = (sector_intel or {}).get("vaxai_fit", {}).get("va_less_suitable_when", "")
    hooks = (sector_intel or {}).get("vaxai_fit", {}).get("meeting_hooks", [])

    dm_name = record.get("decision_maker_name") or "(not yet confirmed)"
    dm_role = record.get("decision_maker_role") or "Chief Executive / Director of Operations"
    email = record.get("email") or (cc or {}).get("charity_contact_email") or "see contact source"
    phone = record.get("phone") or (cc or {}).get("charity_contact_phone") or ""

    contact_line = f"{dm_name} ({dm_role})"
    if email:
        contact_line += f" — {email}"
    if phone:
        contact_line += f" — {phone}"

    hook = hooks[0] if hooks else f"Reduce reporting and coordination burden across {sector_label.lower()} programmes."

    lines = [
        f"MEETING PREP — {org} ({sector_label})",
        "",
        "WHAT THE ORGANISATION DOES:",
        what,
        "",
        "ORGANISATION CONTEXT:",
        (
            f"{record.get('location', '')}, {record.get('region', '')}. "
            f"~{record.get('employees') or 'unknown'} staff; income on record £{record['annual_revenue_gbp']:,}."
            if record.get("annual_revenue_gbp")
            else f"{record.get('location', '')}, {record.get('region', '')}. ~{record.get('employees') or 'unknown'} staff."
        ),
        "",
        f"RECOMMENDED VAxAI ENTRY: {primary}",
        "",
        "WHY ADMIN / AI PRESSURE IS HIGH:",
        admin,
        "",
        "CHARITY / SECTOR AI CONTEXT (use in conversation):",
        ai_notes or "Many charities improve admin through workflow review and governed AI drafting before any new system.",
        "",
    ]
    if va_less:
        lines.extend(["WHERE VA ALONE IS NOT THE RIGHT LEAD:", va_less, ""])
    lines.extend(
        [
            "STRONGEST REASON TO CONTACT:",
            f"{org} shows {sector_label.lower()} delivery with material admin load — {hook}",
            "",
            "HOW TO PRESENT VAxAI:",
            "Position VAxAI as wraparound support: review existing systems, train staff on practical AI, and offer flexible virtual assistance for follow-through — not a CRM or case-system replacement.",
            "",
            "SUGGESTED CALL HOOKS / DISCOVERY QUESTIONS:",
        ]
    )
    for h in hooks[:3]:
        lines.append(f"• {h}")
    lines.extend(
        [
            "",
            "DISCOVERY PROMPTS FOR THIS CALL:",
            "• Which reporting, referral, or volunteer workflows consume the most coordinator time?",
            "• What systems are in use today — and where do spreadsheets or email still carry the load?",
            "• Has anyone been asked to explore AI, and is there a policy or governance concern?",
            "• What would success look like in 90 days for the operations or programmes team?",
            "",
            "CONFIDENCE NOTES:",
            build_evidence_block(record, cc, web, {}),
            "",
            "RECOMMENDED NEXT ACTION:",
            recommended_next_action(record, {}, True),
            "",
            f"Research date: {RESEARCH_DATE}. Validate contact and programme fit before outreach.",
        ]
    )
    return "\n".join(lines)


def enrich_business(record: dict, web: str) -> dict:
    sections = parse_meeting_prep(record.get("engagement_approach", ""))
    sector_intel = match_smb_sector(record.get("sector_tags", []))
    complexity = infer_complexity(record.get("employees"), record.get("annual_revenue_gbp"), "Business")
    entry = sections.get("RECOMMENDED VAxAI ENTRY", "")
    direct, partial, partner = pick_support(entry, sector_intel, False)

    likely = sections.get("WHY ADMIN / AI PRESSURE IS HIGH") or record.get("need_rationale", "")
    if likely and not likely.endswith("."):
        likely = likely.split(".")[0] + "."

    evidence = build_evidence_block(record, None, web, sections)
    open_q = build_open_questions(record, sections, sector_intel)
    recommended = build_recommended_engagement(record, sections, sector_intel, False)
    next_action = recommended_next_action(record, sections, False)

    engagement = record.get("engagement_approach", "")
    if "CONFIDENCE NOTES:" not in engagement:
        engagement = engagement.rstrip() + f"\n\nCONFIDENCE NOTES:\n{evidence}\n\nRECOMMENDED NEXT ACTION:\n{next_action}"

    boundaries = (
        "VAxAI can lead discovery, workflow review, training, and virtual assistance. "
        + (sections.get("WHERE VA ALONE IS NOT THE RIGHT LEAD") or "Complex integrations or platform replacement need a specialist partner.")
    )[:400]

    service_summary = (
        f"{record['organisation_name']}: {likely[:120]} — {complexity} complexity. "
        f"Best fit: {direct[0].lower()}."
    )[:280]

    out = dict(record)
    out.update(
        {
            "likely_need": likely[:500],
            "complexity_level": complexity,
            "complexity_rationale": (
                f"{record.get('employees') or 'Unknown'} employees and {record.get('sector_tags', [''])[0]} sector "
                f"suggest {complexity.lower()} delivery complexity."
            ),
            "vaxai_direct_support": direct,
            "vaxai_partial_support": partial,
            "partner_support": partner,
            "capability_boundaries": boundaries,
            "recommended_engagement": recommended,
            "engagement_basis": "project" if (record.get("employees") or 0) >= 12 else "ad_hoc",
            "service_fit_summary": service_summary,
            "evidence_summary": evidence,
            "open_questions": open_q,
            "systems_landscape": (
                sections.get("WHY ADMIN / AI PRESSURE IS HIGH", "")[:200]
                + " — assume established sector tools with manual handoffs unless discovery says otherwise."
            )[:350],
            "admin_capacity": "Moderate" if (record.get("employees") or 0) > 25 else "Limited",
            "ai_automation_use": "Limited",
            "data_sensitivity": "Elevated" if any(t in str(record.get("sector_tags")) for t in ("legal", "insurance", "care")) else "Standard",
            "internal_capability": "Moderate",
            "accessibility_considerations": None,
            "build_vs_improve": "improve_existing",
            "bespoke_build_fit": False,
            "bespoke_build_note": "Organisation size and sector make improving existing tools the default starting point.",
            "engagement_approach": engagement,
            "research_date": RESEARCH_DATE,
        }
    )
    return out


def enrich_charity(record: dict, cc: dict | None, web: str) -> dict:
    activities = (cc or {}).get("charity_activities", "")
    sector_intel = match_charity_sector(record.get("sector_tags", []), activities)
    sections: dict[str, str] = {}
    if "MEETING PREP" in (record.get("engagement_approach") or ""):
        sections = parse_meeting_prep(record["engagement_approach"])
        engagement = record["engagement_approach"]
    else:
        engagement = build_charity_meeting_prep(record, cc, web, sector_intel)
        sections = parse_meeting_prep(engagement)

    if cc:
        if not record.get("email") and cc.get("charity_contact_email"):
            record = {**record, "email": cc["charity_contact_email"]}
        if not record.get("phone") and cc.get("charity_contact_phone"):
            record = {**record, "phone": str(cc.get("charity_contact_phone"))}
        if cc.get("charity_activities") and len(record.get("need_rationale", "")) < 100:
            record = {**record, "need_rationale": cc["charity_activities"][:500]}

    complexity = infer_complexity(record.get("employees"), record.get("annual_revenue_gbp"), "Charity")
    entry = sections.get("RECOMMENDED VAxAI ENTRY", "")
    direct, partial, partner = pick_support(entry, sector_intel, True)

    likely = sections.get("WHY ADMIN / AI PRESSURE IS HIGH") or record.get("need_rationale", "")
    evidence = build_evidence_block(record, cc, web, sections)
    open_q = build_open_questions(record, sections, sector_intel)
    recommended = build_recommended_engagement(record, sections, sector_intel, True)
    next_action = recommended_next_action(record, sections, True)

    if "CONFIDENCE NOTES:" not in engagement:
        engagement = engagement.rstrip() + f"\n\nCONFIDENCE NOTES:\n{evidence}\n\nRECOMMENDED NEXT ACTION:\n{next_action}"

    accessibility = None
    if sector_intel and sector_intel.get("sector_key") in ("disability", "care", "health"):
        accessibility = (
            "Where workflow or AI changes are proposed, check impact on neurodivergent staff and service users; "
            "pair tooling with flexible human coordination."
        )

    service_summary = (
        f"{record['organisation_name']}: {(likely[:100] if likely else sector_intel.get('sector_label', 'Charity'))} — "
        f"{complexity} complexity. Best fit: {direct[0].lower()}."
    )[:280]

    out = dict(record)
    out.update(
        {
            "likely_need": (likely[:500] if likely else (sector_intel or {}).get("admin_burden", ""))[:500],
            "complexity_level": complexity,
            "complexity_rationale": (
                f"{record.get('employees') or 'Estimated'} staff and charity operating context suggest "
                f"{complexity.lower()} delivery complexity."
            ),
            "vaxai_direct_support": direct,
            "vaxai_partial_support": partial,
            "partner_support": partner,
            "capability_boundaries": (
                (sector_intel or {}).get("vaxai_fit", {}).get("va_less_suitable_when")
                or "VAxAI can support review, training, and virtual assistance; regulated case systems and bespoke builds need partners."
            )[:400],
            "recommended_engagement": recommended,
            "engagement_basis": "mixed" if (record.get("employees") or 0) >= 20 else "ad_hoc",
            "service_fit_summary": service_summary,
            "evidence_summary": evidence,
            "open_questions": open_q,
            "systems_landscape": (
                (sector_intel or {}).get("admin_burden", "")[:200]
                + " — likely familiar charity CRM/case tools plus spreadsheet coordination."
            )[:350],
            "admin_capacity": "Limited" if (record.get("employees") or 0) > 30 else "Moderate",
            "ai_automation_use": "Limited",
            "data_sensitivity": "High" if sector_intel and sector_intel.get("sector_key") in ("care", "health", "children", "legal") else "Elevated",
            "internal_capability": "Moderate",
            "accessibility_considerations": accessibility,
            "build_vs_improve": "improve_existing",
            "bespoke_build_fit": (record.get("employees") or 99) < 10,
            "bespoke_build_note": "Charity context favours improving existing systems; any small scoped build needs clear boundaries and partner support.",
            "engagement_approach": engagement,
            "research_date": RESEARCH_DATE,
        }
    )
    return out


def lookup_cc(record: dict, by_name: dict[str, dict], by_number: dict[str, dict]) -> dict | None:
    num = parse_charity_number(record.get("financial_source_url", ""))
    if num and num in by_number:
        return by_number[num]
    key = norm_name(record.get("organisation_name", ""))
    return by_name.get(key)


def enrich_record(record: dict, by_name: dict[str, dict], by_number: dict[str, dict], web_cache: dict[str, str], skip_web: bool) -> dict:
    is_charity = record.get("organisation_type", "").startswith("Charity") or record.get("organisation_type") == "Social enterprise"
    url = record.get("website") or record.get("contact_source_url") or ""
    web = ""
    if not skip_web and url:
        if url in web_cache:
            web = web_cache[url]
        else:
            web = fetch_website_snippet(url)
            web_cache[url] = web
            time.sleep(0.15)

    if is_charity:
        cc = lookup_cc(record, by_name, by_number)
        return enrich_charity(record, cc, web)
    return enrich_business(record, web)


def backup_catalog(catalog: dict) -> Path:
    stamp = RESEARCH_DATE.replace("-", "")
    backup_dir = CATALOG_PATH.parent / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    path = backup_dir / f"catalog.pre-enrich.{stamp}.json"
    path.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich prospect catalog research")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--skip-web", action="store_true", help="Skip live website fetches (CC + existing data only)")
    args = parser.parse_args()

    catalog = json.loads(CATALOG_PATH.read_text())
    prospects = catalog["prospects"]
    end = len(prospects) if args.all else min(len(prospects), args.start + args.limit)
    batch = prospects[args.start:end]

    by_name, by_number = load_cc_index()
    web_cache: dict[str, str] = {}
    enriched = []
    for record in batch:
        enriched.append(enrich_record(record, by_name, by_number, web_cache, args.skip_web))

    changed = sum(1 for a, b in zip(batch, enriched) if json.dumps(a, sort_keys=True) != json.dumps(b, sort_keys=True))
    print(f"Batch {args.start}:{end} — {len(batch)} records, {changed} changed, web fetches {len(web_cache)}")

    if args.dry_run or not args.apply:
        for r in enriched[:3]:
            print("\n===", r["organisation_name"], "===")
            print("Summary:", r.get("service_fit_summary", "")[:200])
            print("Next:", r.get("recommended_engagement", "")[-180:])
        print("\nDry run — pass --apply to write.")
        return

    backup = backup_catalog(catalog)
    catalog["prospects"][args.start:end] = enriched
    catalog["meta"]["research_date"] = RESEARCH_DATE
    catalog["meta"]["methodology"] = (
        "Prospect Finder enrichment (June 2026): org-specific research built on existing records, "
        "Charity Commission open data, website verification, and sector intelligence. "
        "Wraparound review, workflow improvement, training, VAT-informed AI strategy, and virtual assistance — "
        "not default new-system builds. Evidence marked VERIFIED / INTERPRETED / TO CONFIRM."
    )
    CATALOG_PATH.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    print(f"Backup: {backup}")
    print(f"Updated catalog records {args.start}:{end}")


if __name__ == "__main__":
    main()