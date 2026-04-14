"""
RailGuard AI — Sensor Simulator
Generates realistic railway sensor readings.

Normal mode:  random walk within RDSO safe thresholds.
Failure mode: exponential drift toward danger zone.

Sensor thresholds (RDSO/2019/CG-06 + IS 3073):
  Vibration   warn=5 mm/s   danger=8 mm/s
  Temperature warn=70°C     danger=90°C
  Acoustic    warn=60 dB    danger=80 dB
  Track Wear  warn=50%      danger=75%
"""

import random
import math
from datetime import datetime
from app.models.schemas import SensorReading, BogieStatus, HealthState


class SensorSimulator:
    """Stateful sensor simulator — maintains current sensor values."""

    BOGIE_LABELS = [
        "Bogie 1 (Front)", "Bogie 2", "Bogie 3",
        "Bogie 4", "Bogie 5", "Bogie 6 (Rear)",
    ]

    def __init__(self):
        # Initial safe values
        self.vib  = 2.5
        self.temp = 55.0
        self.acou = 42.0
        self.wear = 18.0
        self.tick = 0

    def next(self, failure_mode: bool) -> SensorReading:
        """Generate the next sensor reading."""
        self.tick += 1

        if failure_mode:
            # Exponential ramp toward danger zone
            self.vib  = min(11.5, self.vib  + random.uniform(0.3, 0.9))
            self.temp = min(105.0, self.temp + random.uniform(0.8, 1.8))
            self.acou = min(95.0,  self.acou + random.uniform(1.0, 2.2))
            self.wear = min(85.0,  self.wear + random.uniform(0.2, 0.6))
        else:
            # Random walk with mean reversion toward safe centre
            self.vib  = max(0.5,  min(5.0,  self.vib  + (random.random() - 0.5) * 0.6))
            self.temp = max(35.0, min(68.0,  self.temp + (random.random() - 0.5) * 1.5))
            self.acou = max(25.0, min(58.0,  self.acou + (random.random() - 0.5) * 2.5))
            self.wear = max(5.0,  min(40.0,  self.wear + (random.random() - 0.5) * 0.3))

        return SensorReading(
            vibration=round(self.vib, 2),
            temperature=round(self.temp, 1),
            acoustic=round(self.acou, 1),
            wear=round(self.wear, 1),
        )

    def reset(self):
        """Reset to safe initial values."""
        self.vib  = 2.5
        self.temp = 55.0
        self.acou = 42.0
        self.wear = 18.0

    def generate_bogies(self, failure_mode: bool) -> list[BogieStatus]:
        """Generate status for all 6 bogies."""
        if failure_mode:
            statuses = [HealthState.DANGER, HealthState.WARN,
                        HealthState.DANGER, HealthState.WARN,
                        HealthState.DANGER, HealthState.WARN]
            base_temps = [89, 72, 91, 70, 88, 67]
        else:
            statuses   = [HealthState.GOOD] * 4 + [HealthState.WARN, HealthState.GOOD]
            base_temps = [52, 49, 54, 51, 68, 55]

        return [
            BogieStatus(
                id=f"B{i+1}",
                label=self.BOGIE_LABELS[i],
                status=statuses[i],
                temp=base_temps[i] + random.randint(-3, 3),
            )
            for i in range(6)
        ]

    def get_maintenance(self, failure_mode: bool, sensors: SensorReading) -> list[dict]:
        """Return contextual maintenance recommendations."""
        if failure_mode:
            return [
                {"title": "STOP TRAIN — Emergency Inspection",
                 "detail": "Critical vibration and heat. Immediate stop required.",
                 "urgency": "urgent", "icon": "🚨"},
                {"title": "Cool Down Axle Bearings",
                 "detail": "Temperature >85°C on Bogies 1,3,5. Apply coolant now.",
                 "urgency": "urgent", "icon": "🔥"},
                {"title": "Replace Wheel Bearings B1, B3",
                 "detail": "4-hour service window required. Part no. WB-4471.",
                 "urgency": "today", "icon": "🔧"},
            ]
        items = [{"title": "Wheel Inspection",
                  "detail": "All wheels within safe limits.", "urgency": "done", "icon": "✅"}]
        if sensors.wear > 30:
            items.append({"title": "Lubricate Axle Bearings",
                          "detail": "Friction elevated. Service within 7 days.",
                          "urgency": "soon", "icon": "🔩"})
        items.append({"title": "Brake Pad Measurement",
                      "detail": "Pads at ~69% life. Check before next long run.",
                      "urgency": "planned", "icon": "🔍"})
        return items


# Singleton used across the app
simulator = SensorSimulator()
