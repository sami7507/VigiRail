"""
VigiRail — Sensor simulator.

Produces a random-walk sensor stream that stays inside RDSO safe zones, or
ramps exponentially toward the danger zone when failure simulation is active.

Thresholds (RDSO/2019/CG-06, IS 3073, IEC 60721):
                warn      danger
  vibration     5 mm/s    8 mm/s
  temperature   70 °C     90 °C
  acoustic      60 dB     80 dB
  wear          50 %      75 %
"""

from __future__ import annotations

import random
import threading

from app.models.schemas import (
    BogieStatus,
    HealthState,
    MaintenanceItem,
    SensorReading,
    Urgency,
)

BOGIE_LABELS = [
    "Bogie 1 (Front)",
    "Bogie 2",
    "Bogie 3",
    "Bogie 4",
    "Bogie 5",
    "Bogie 6 (Rear)",
]


class SensorSimulator:
    """Stateful simulator — one instance per process (see `simulator` below)."""

    def __init__(self, seed: int | None = None) -> None:
        self._rng = random.Random(seed)
        self._lock = threading.Lock()
        self.reset()

    def reset(self) -> None:
        with self._lock:
            self.vib = 2.5
            self.temp = 55.0
            self.acou = 42.0
            self.wear = 18.0

    def next(self, failure_mode: bool) -> SensorReading:
        with self._lock:
            if failure_mode:
                # Accelerating failure ramp toward the danger zone
                # (wear stands in for cumulative damage, so it climbs fastest).
                self.vib = min(11.5, self.vib + self._rng.uniform(0.5, 1.2))
                self.temp = min(105.0, self.temp + self._rng.uniform(1.2, 2.5))
                self.acou = min(95.0, self.acou + self._rng.uniform(1.5, 3.0))
                self.wear = min(85.0, self.wear + self._rng.uniform(1.0, 2.2))
            else:
                # Mean-reverting random walk inside safe limits.
                self.vib = max(0.5, min(5.0, self.vib + (self._rng.random() - 0.5) * 0.6))
                self.temp = max(35.0, min(68.0, self.temp + (self._rng.random() - 0.5) * 1.5))
                self.acou = max(25.0, min(58.0, self.acou + (self._rng.random() - 0.5) * 2.5))
                self.wear = max(5.0, min(40.0, self.wear + (self._rng.random() - 0.5) * 0.3))
            return SensorReading(
                vibration=round(self.vib, 2),
                temperature=round(self.temp, 1),
                acoustic=round(self.acou, 1),
                wear=round(self.wear, 1),
            )

    # ── Bogies ───────────────────────────────────────────────────────
    @staticmethod
    def _classify(temp: float) -> HealthState:
        if temp >= 90:
            return HealthState.DANGER
        if temp >= 70:
            return HealthState.WARN
        return HealthState.GOOD

    def generate_bogies(self, failure_mode: bool) -> list[BogieStatus]:
        """Six bogies; bearing temps track the live temperature sensor."""
        with self._lock:
            base_temp = self.temp
        rng = self._rng
        offsets = [-2, -5, 1, -4, 4, -1]
        result = []
        for i, label in enumerate(BOGIE_LABELS):
            if failure_mode:
                # Alternating hot/critical pattern under simulated failure.
                bias = 18 if i % 2 == 0 else 6
                temp = base_temp + bias + rng.uniform(-2, 4)
            else:
                temp = base_temp + offsets[i] + rng.uniform(-2, 2)
            result.append(
                BogieStatus(
                    id=f"B{i + 1}",
                    label=label,
                    status=self._classify(temp),
                    temp=int(round(temp)),
                )
            )
        return result

    # ── Maintenance recommendations ──────────────────────────────────
    @staticmethod
    def get_maintenance(failure_mode: bool, sensors: SensorReading) -> list[MaintenanceItem]:
        """Contextual work orders derived from the live readings (no emojis —
        the UI maps urgency to icons)."""
        if failure_mode or sensors.vibration >= 8 or sensors.temperature >= 90:
            return [
                MaintenanceItem(
                    title="Stop train — emergency inspection",
                    detail="Vibration or bearing temperature beyond critical limits. Halt at the next safe halt.",
                    urgency=Urgency.URGENT,
                ),
                MaintenanceItem(
                    title="Cool axle bearings",
                    detail="Bearing temperature above 90 °C. Inspect and cool bogies before resuming.",
                    urgency=Urgency.URGENT,
                ),
                MaintenanceItem(
                    title="Replace wheel bearing set",
                    detail="Order bearing set WB-4471; allow a 4-hour service window.",
                    urgency=Urgency.SOON,
                ),
            ]

        items: list[MaintenanceItem] = []
        if sensors.vibration >= 5:
            items.append(
                MaintenanceItem(
                    title="Inspect wheel bearings",
                    detail="Vibration approaching the 5 mm/s advisory limit. Check bearing clearance.",
                    urgency=Urgency.SOON,
                )
            )
        if sensors.temperature >= 70:
            items.append(
                MaintenanceItem(
                    title="Check axle-box lubrication",
                    detail="Bearing temperature in the advisory band. Regrease at the next depot.",
                    urgency=Urgency.SOON,
                )
            )
        if sensors.wear >= 50:
            items.append(
                MaintenanceItem(
                    title="Rail / pad wear measurement",
                    detail="Wear above 50%. Schedule ultrasonic measurement this week.",
                    urgency=Urgency.SOON,
                )
            )
        items.append(
            MaintenanceItem(
                title="Routine brake-pad measurement",
                detail="Next scheduled check before the following long-distance run.",
                urgency=Urgency.PLANNED,
            )
        )
        if not any(i.urgency == Urgency.URGENT for i in items) and len(items) == 1:
            items.insert(
                0,
                MaintenanceItem(
                    title="All systems within limits",
                    detail="No corrective work required — continue routine monitoring.",
                    urgency=Urgency.OK,
                ),
            )
        return items


# Imported by API routes and tests.
simulator = SensorSimulator()
