# reports.py
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

DATA_FILE = Path("data/reports.json")
_lock = Lock()


def _load():
    if not DATA_FILE.exists():
        return []
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def _save(items):
    DATA_FILE.parent.mkdir(exist_ok=True)
    DATA_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def _status(labels, fire_alert):
    if fire_alert == "high":
        return "fire"      # red icon
    if labels:
        return "waste"     # yellow icon
    return "clean"         # green icon (cleaned, no waste)


def list_reports():
    with _lock:
        return _load()


def add_report(lat, lng, labels, risk_score, fire_alert, note=""):
    item = {
        "id": uuid.uuid4().hex[:8],
        "lat": lat,
        "lng": lng,
        "labels": labels,
        "risk_score": risk_score,
        "fire_alert": fire_alert,
        "status": _status(labels, fire_alert),
        "note": note,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "cleaned_at": None,
    }
    with _lock:
        items = _load()
        items.append(item)
        _save(items)
    return item


def mark_clean(report_id, method="self"):
    with _lock:
        items = _load()
        for item in items:
            if item["id"] == report_id:
                item["status"] = "clean"
                item["cleaned_at"] = datetime.now(timezone.utc).isoformat()
                item["cleaned_by"] = method  # "self" | "volunteers" | "municipality"
                _save(items)
                return item
    return None