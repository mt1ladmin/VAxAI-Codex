"""Shared filters for prospect outreach catalog building."""
from __future__ import annotations

import re

EXCLUDE_NAME_RE = re.compile(
    r"(university|college in the university|nhs foundation|nhs trust|hospital nhs|"
    r"church of england soldiers|diocese of|parochial church council|"
    r"\bllp\b|\bltd\b|\blimited\b|\bplc\b|merchant venturers|"
    r"solicitors?|accountants?|accountancy|chartered surveyors|"
    r"college of saint|college of st\.|hall of saint|hall of st\.|"
    r"master fellows and scholars|master and fellows)",
    re.I,
)


def is_excluded_org(name: str) -> bool:
    return bool(EXCLUDE_NAME_RE.search(name or ""))