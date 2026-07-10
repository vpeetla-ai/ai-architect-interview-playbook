# Design a parking lot (LLD / machine coding)

## The question, as it might actually be asked

Design a multi-level parking lot that assigns spots by vehicle type, issues tickets on entry, and computes fees on exit. Support concurrent entry/exit safely.

## The framework

Clarify constraints → entities → allocation strategy → fee policy → thread-safety.

## Where this actually gets asked

Among the highest-frequency LLD problems (parking lot appears in a large fraction of machine-coding rounds). Tests OOP, Strategy, and concurrency.

## Problem

Implement park/leave with:
- Spot types: motorcycle, compact, large
- Vehicle types mapping to allowable spots
- Ticket with entry timestamp
- Fee strategy (hourly flat for interview)

## Clarifying questions you should ask first

1. Levels and spot counts per type?
2. Can a car take a large spot? (usually yes)
3. Fee model?
4. Concurrent gates?
5. Reservation / EV — out of scope?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | One list of free spots |
| Correct | Typed free-sets + ticket map |
| Staff+ | Strategy for allocation + priced fees + locks |

## Reference solution (Python)

```python
from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from threading import Lock
import time
import uuid

class SpotType(Enum):
    MOTORCYCLE = 1
    COMPACT = 2
    LARGE = 3

class VehicleType(Enum):
    MOTORCYCLE = 1
    CAR = 2
    BUS = 3

# vehicle can use spot if spot.value >= vehicle.value (bus needs LARGE only)
ALLOW = {
    VehicleType.MOTORCYCLE: {SpotType.MOTORCYCLE, SpotType.COMPACT, SpotType.LARGE},
    VehicleType.CAR: {SpotType.COMPACT, SpotType.LARGE},
    VehicleType.BUS: {SpotType.LARGE},
}

@dataclass
class Spot:
    id: str
    level: int
    type: SpotType

@dataclass
class Ticket:
    id: str
    spot_id: str
    vehicle_type: VehicleType
    entry_ts: float

class ParkingLot:
    def __init__(self, spots: list[Spot], hourly_rate: float = 10.0) -> None:
        self.hourly_rate = hourly_rate
        self._lock = Lock()
        self._free: dict[SpotType, list[Spot]] = {t: [] for t in SpotType}
        self._all = {s.id: s for s in spots}
        for s in spots:
            self._free[s.type].append(s)
        self._active: dict[str, Ticket] = {}

    def _allocate(self, vt: VehicleType) -> Spot | None:
        for st in (SpotType.MOTORCYCLE, SpotType.COMPACT, SpotType.LARGE):
            if st in ALLOW[vt] and self._free[st]:
                return self._free[st].pop()
        return None

    def park(self, vehicle_type: VehicleType) -> Ticket:
        with self._lock:
            spot = self._allocate(vehicle_type)
            if spot is None:
                raise RuntimeError("lot full for vehicle type")
            t = Ticket(id=str(uuid.uuid4()), spot_id=spot.id,
                       vehicle_type=vehicle_type, entry_ts=time.time())
            self._active[t.id] = t
            return t

    def leave(self, ticket_id: str, now: float | None = None) -> float:
        with self._lock:
            t = self._active.pop(ticket_id, None)
            if t is None:
                raise KeyError("unknown ticket")
            spot = self._all[t.spot_id]
            self._free[spot.type].append(spot)
            now = time.time() if now is None else now
            hours = max(1.0, (now - t.entry_ts) / 3600.0)  # ceil-ish min 1h
            return round(hours * self.hourly_rate, 2)
```

**Complexity:** park/leave O(1) amortized with typed free lists.

## Verbal tests to narrate

1. Car parks in compact; leave returns fee ≥ hourly_rate
2. Bus only takes large; lot with only compact → full error
3. Two threads parking last spot — one wins (lock)

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Allocation strategy | Nearest-to-entrance vs first-fit — Strategy pattern |
| Concurrency | Single lock vs per-level locks |
| Pricing | Progressive rates, lost ticket |
| Extensibility | EV spots without rewriting core |

## What not to discuss

- Payment gateway integrations in a 45-minute LLD
- Computer vision license-plate ML

## What's expected at each level

- **Mid-level:** classes for spot/car/ticket.
- **Senior:** typed allocation + fees + clear API.
- **Staff+:** concurrency + strategy for allocation/pricing.
- **Principal:** multi-lot campus routing and utilization analytics hook points.

## Follow-up questions to expect

- "How do you prefer closer spots?" — priority queues per type keyed by distance.

## Related

- [12-elevator-system-lld.md](12-elevator-system-lld.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
