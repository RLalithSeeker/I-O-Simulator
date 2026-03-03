from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional
import time

class IOMode(Enum):
    POLLING = auto()
    INTERRUPT = auto()

class IOType(Enum):
    READ = auto()
    WRITE = auto()

class IOStatus(Enum):
    PENDING = auto()
    RUNNING = auto()
    COMPLETE = auto()

@dataclass
class IORequest:
    request_id: int
    device_id: str
    io_type: IOType
    mode: IOMode
    size_kb: float
    arrival_time: float = field(default_factory=time.time)
    start_time: Optional[float] = None
    completion_time: Optional[float] = None
    status: IOStatus = IOStatus.PENDING
    
    # Metrics
    cpu_checks: int = 0
    
    @property
    def response_time(self) -> Optional[float]:
        if self.completion_time and self.arrival_time:
            return (self.completion_time - self.arrival_time) * 1000 # in ms
        return None

    @property
    def service_time(self) -> Optional[float]:
        if self.completion_time and self.start_time:
            return (self.completion_time - self.start_time) * 1000 # in ms
        return None
