# Design an elevator system (LLD / machine coding)

## The question, as it might actually be asked

Model one or more elevators serving floors. Handle hall calls (up/down) and cabin requests. Simulate time with a `step()` tick rather than real threads sleeping. Choose a dispatch strategy (e.g., SCAN).

## The framework

Clarify constraints → entities + state machine → working simulation → concurrency notes → Staff+ multi-elevator dispatcher.

## Where this actually gets asked

Very high-frequency LLD / machine-coding round (Microsoft and others). Tests state machines + scheduling, not distributed systems.

## Problem

Implement:
- `request_elevator(floor, direction)`
- `press_floor(elevator_id, floor)`
- `step()` advancing simulation one time unit
- Optional: `status()` for debugging

## Clarifying questions you should ask first

1. Number of elevators and floors?
2. Capacity / weight — in or out of scope?
3. SCAN vs nearest-car vs zones?
4. Doors open/close consume ticks?
5. Concurrent requests — lock model?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Always send elevator 0 |
| Correct | Per-elevator state machine + SCAN direction |
| Staff+ | Dispatcher assigning hall calls to best elevator |

## Reference solution (Python)

```python
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from threading import Lock

class Dir(Enum):
    UP = 1
    DOWN = -1
    IDLE = 0

class ElevState(Enum):
    IDLE = "idle"
    MOVING = "moving"
    DOOR_OPEN = "door_open"

@dataclass
class Elevator:
    id: int
    floor: int = 0
    dir: Dir = Dir.IDLE
    state: ElevState = ElevState.IDLE
    stops: set[int] = field(default_factory=set)

    def add_stop(self, floor: int) -> None:
        self.stops.add(floor)

    def step(self) -> None:
        if self.state == ElevState.DOOR_OPEN:
            self.state = ElevState.MOVING if self.stops else ElevState.IDLE
            if not self.stops:
                self.dir = Dir.IDLE
            return
        if not self.stops:
            self.state = ElevState.IDLE
            self.dir = Dir.IDLE
            return
        if self.dir == Dir.IDLE:
            target = min(self.stops, key=lambda f: abs(f - self.floor))
            self.dir = Dir.UP if target > self.floor else Dir.DOWN
        self.state = ElevState.MOVING
        self.floor += self.dir.value
        if self.floor in self.stops:
            self.stops.remove(self.floor)
            self.state = ElevState.DOOR_OPEN
            # reverse if no further stops in current direction
            if self.dir == Dir.UP and not any(f > self.floor for f in self.stops):
                self.dir = Dir.DOWN if any(f < self.floor for f in self.stops) else Dir.IDLE
            elif self.dir == Dir.DOWN and not any(f < self.floor for f in self.stops):
                self.dir = Dir.UP if any(f > self.floor for f in self.stops) else Dir.IDLE

class ElevatorSystem:
    def __init__(self, n_elevators: int, n_floors: int) -> None:
        self.n_floors = n_floors
        self.elevators = [Elevator(i) for i in range(n_elevators)]
        self._lock = Lock()

    def _pick(self, floor: int, direction: Dir) -> Elevator:
        # Prefer idle, else nearest moving toward the caller
        def score(e: Elevator) -> tuple:
            if e.state == ElevState.IDLE:
                return (0, abs(e.floor - floor))
            toward = (e.dir == direction) and (
                (direction == Dir.UP and e.floor <= floor) or
                (direction == Dir.DOWN and e.floor >= floor)
            )
            return (1 if toward else 2, abs(e.floor - floor))
        return min(self.elevators, key=score)

    def request_elevator(self, floor: int, direction: Dir) -> int:
        with self._lock:
            if not (0 <= floor < self.n_floors):
                raise ValueError("bad floor")
            e = self._pick(floor, direction)
            e.add_stop(floor)
            return e.id

    def press_floor(self, elevator_id: int, floor: int) -> None:
        with self._lock:
            self.elevators[elevator_id].add_stop(floor)

    def step(self) -> None:
        with self._lock:
            for e in self.elevators:
                e.step()
```

**Complexity:** step O(E + stops); pick O(E).

## Verbal tests to narrate

1. Idle elevator at 0; request floor 5 UP → arrives, door opens
2. Cabin press 0 while going up → serves after reversing (SCAN)
3. Two elevators: nearer idle wins

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| SCAN vs SSTF | Avoid starvation vs local optimum |
| Multi-elevator | Zones for tall buildings |
| Concurrency | One lock around step+request or actor per elevator |
| Simulation | Tick model beats real-time sleeps in interviews |

## What not to discuss

- Microcontroller wiring or CAN bus
- Distributed consensus for elevators

## What's expected at each level

- **Mid-level:** single elevator moves to requested floor.
- **Senior:** state machine + direction + multiple stops.
- **Staff+:** dispatcher scoring + concurrency + starvation discussion.
- **Principal:** zoning / peak-mode strategies for real buildings.

## Follow-up questions to expect

- "How do you prevent starvation of the top floor?" — SCAN guarantees progress; FCFS can starve.

## Related

- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
- [13-parking-lot-lld.md](13-parking-lot-lld.md)
