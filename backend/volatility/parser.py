"""Turn Volatility JSON renderer output into structured rows."""
import json
from typing import Any


def parse_json_output(raw: str) -> dict:
    """Parse Volatility -r json output.

    Volatility 3's json renderer emits ONE pretty-printed JSON array
    spanning multiple lines. Older/other plugins may emit line-delimited
    JSON (JSONL). Handle both.
    """
    text = (raw or "").strip()
    if not text:
        return {"columns": [], "rows": []}

    rows: list[dict[str, Any]] = []

    # Try the whole payload as a single JSON document first.
    try:
        payload = json.loads(text)
        rows.extend(_flatten(payload))
    except json.JSONDecodeError:
        # Fall back to line-delimited JSON (one object per line).
        for line in text.splitlines():
            line = line.strip()
            if not line or not line.startswith(("{", "[")):
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError:
                continue
            rows.extend(_flatten(payload))

    # Drop empty rows.
    rows = [r for r in rows if any(str(v).strip() for v in r.values())]

    # Build column list (stable order, first-seen first).
    seen: set[str] = set()
    columns: list[str] = []
    for r in rows:
        for k in r.keys():
            if k not in seen and not k.startswith("__"):
                seen.add(k)
                columns.append(k)

    return {"columns": columns, "rows": rows}


def _flatten(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        out: list[dict[str, Any]] = []
        for item in payload:
            out.extend(_flatten(item))
        return out
    if isinstance(payload, dict):
        children = payload.pop("__children", [])
        clean = {k: v for k, v in payload.items() if not k.startswith("__")}
        result = [clean] if clean else []
        if children:
            result.extend(_flatten(children))
        return result
    return []


def render_table(rows: list[dict], columns: list[str]) -> str:
    if not rows or not columns:
        return "(no output)"
    widths = {
        c: max(len(c), *(len(str(r.get(c, ""))) for r in rows))
        for c in columns
    }
    header = "  ".join(c.ljust(widths[c]) for c in columns)
    sep = "  ".join("-" * widths[c] for c in columns)
    body = [
        "  ".join(str(r.get(c, "")).ljust(widths[c]) for c in columns)
        for r in rows
    ]
    return "\n".join([header, sep, *body])