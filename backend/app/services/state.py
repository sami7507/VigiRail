"""
RailGuard AI — In-Memory State Store
Holds simulation flags, history, and alert records.
In production, replace with Redis or PostgreSQL.
"""
from collections import deque
from app.models.schemas import HistoryRecord, AlertRecord
from app.core.config import settings

_alert_id_counter = 0


class AppState:
    def __init__(self):
        self.failure_mode  = False
        self.selected_train = "12951"
        self.tick          = 0
        self.alerts_today  = 0
        self.history: deque[dict] = deque(maxlen=settings.MAX_HISTORY_RECORDS)
        self.alerts:  deque[dict] = deque(maxlen=200)

    def push_history(self, record: dict):
        self.history.appendleft(record)

    def push_alert(self, message: str, severity: str, train_id: str):
        global _alert_id_counter
        _alert_id_counter += 1
        from datetime import datetime
        self.alerts.appendleft({
            "id":        _alert_id_counter,
            "timestamp": datetime.now().isoformat(),
            "train_id":  train_id,
            "message":   message,
            "severity":  severity,
            "read":      False,
        })
        if severity in ("warn", "danger"):
            self.alerts_today += 1

    def reset(self):
        self.failure_mode = False
        self.alerts_today = 0


# Singleton
app_state = AppState()
