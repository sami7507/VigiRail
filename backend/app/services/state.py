"""
VigiRail — Thread-safe in-memory state.

Holds simulation flags, per-train route progress, history and alerts.
FastAPI runs sync endpoints in a worker thread-pool, so every mutation is
guarded by a lock.

Swap-in points for production:
  * history/alerts  → time-series store (TimescaleDB, InfluxDB) or Redis lists
  * failure flag    → shared cache (Redis) if running multiple workers
"""

from __future__ import annotations

import threading
from collections import deque
from datetime import UTC, datetime


def _utcnow() -> datetime:
    return datetime.now(UTC)


class AppState:
    def __init__(self, max_history: int = 500, max_alerts: int = 200) -> None:
        self._lock = threading.Lock()

        self.failure_mode = False
        self.tick = 0
        self.alerts_today = 0
        self.started_at = _utcnow()

        # Newest-first ring buffers.
        self.history: deque[dict] = deque(maxlen=max_history)
        self.alerts: deque[dict] = deque(maxlen=max_alerts)
        self._alert_seq = 0

        # Per-train health state (for edge-triggered alerting) and route progress.
        self._train_state: dict[str, str] = {}
        self.station_index: dict[str, int] = {}
        self.station_health: dict[str, dict[str, int]] = {}

    # ── Simulation ───────────────────────────────────────────────────
    def set_failure_mode(self, enabled: bool) -> None:
        with self._lock:
            self.failure_mode = enabled
            if not enabled:
                self.alerts_today = 0
                # Force a fresh "recovered" alert on the next poll.
                self._train_state.clear()

    # ── Health-state transitions (edge-triggered alerting) ───────────
    def note_state(self, train_id: str, state: str) -> tuple[str | None, str]:
        """Record the latest classified state; return (previous, current)."""
        with self._lock:
            previous = self._train_state.get(train_id)
            self._train_state[train_id] = state
            return previous, state

    # ── Route progress ───────────────────────────────────────────────
    def advance_tick(self) -> int:
        with self._lock:
            self.tick += 1
            return self.tick

    def set_station_health(self, train_id: str, code: str, health: int) -> None:
        with self._lock:
            self.station_health.setdefault(train_id, {})[code] = int(health)

    def advance_station(self, train_id: str, route_length: int) -> int:
        with self._lock:
            idx = self.station_index.get(train_id, 0)
            if idx < route_length - 1:
                idx += 1
                self.station_index[train_id] = idx
            return self.station_index.get(train_id, 0)

    def station_index_for(self, train_id: str) -> int:
        with self._lock:
            return self.station_index.get(train_id, 0)

    def health_for_station(self, train_id: str, code: str) -> int | None:
        with self._lock:
            return self.station_health.get(train_id, {}).get(code)

    # ── History ──────────────────────────────────────────────────────
    def push_history(self, record: dict) -> None:
        with self._lock:
            self.history.appendleft(record)

    def history_page(self, *, limit: int, offset: int, train: str | None = None) -> tuple[int, list[dict]]:
        with self._lock:
            records = list(self.history)
        if train:
            records = [r for r in records if r["train_id"] == train]
        return len(records), records[offset:offset + limit]

    # ── Alerts ───────────────────────────────────────────────────────
    def push_alert(self, message: str, severity: str, train_id: str) -> dict | None:
        """Append an alert. Only warn/danger alerts count toward 'today'."""
        with self._lock:
            self._alert_seq += 1
            alert = {
                "id": self._alert_seq,
                "timestamp": _utcnow().isoformat(),
                "train_id": train_id,
                "message": message,
                "severity": severity,
                "read": False,
            }
            self.alerts.appendleft(alert)
            if severity in ("warn", "danger"):
                self.alerts_today += 1
            return alert

    def alerts_page(self, *, limit: int) -> dict:
        with self._lock:
            alerts = list(self.alerts)[:limit]
            return {
                "alerts": alerts,
                "total_today": self.alerts_today,
                "unread_count": sum(1 for a in self.alerts if not a["read"]),
            }

    def mark_alerts_read(self) -> int:
        with self._lock:
            count = 0
            for alert in self.alerts:
                if not alert["read"]:
                    alert["read"] = True
                    count += 1
            return count

    # ── Snapshot for status endpoints ────────────────────────────────
    def snapshot(self) -> dict:
        with self._lock:
            return {
                "failure_mode": self.failure_mode,
                "uptime_ticks": self.tick,
                "alerts_today": self.alerts_today,
                "history_count": len(self.history),
                "started_at": self.started_at,
            }


# Singleton shared across the application.
app_state = AppState()
