import time
import threading
from enum import Enum
from dataclasses import dataclass
from typing import Callable, List, Optional

class IOType(Enum):
    READ = "READ"
    WRITE = "WRITE"

class IOMode(Enum):
    POLLING = "POLLING"
    INTERRUPT = "INTERRUPT"

class RequestState(Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETE = "COMPLETE"

@dataclass
class IORequest:
    req_id: int
    req_type: IOType
    device: str
    size_kb: int
    mode: IOMode
    service_time_ms: int
    create_time: float = 0.0
    start_time: float = 0.0
    end_time: float = 0.0
    cpu_checks: int = 0
    state: RequestState = RequestState.PENDING

class IODeviceWorker:
    """Simulates the physical I/O device hardware."""
    def __init__(self, name: str):
        self.name = name

    def perform_operation(self, service_time_ms: int):
        # Simulate hardware delay
        time.sleep(service_time_ms / 1000.0)

class Controller:
    """Simulates the device hardware controller."""
    def __init__(self, device: IODeviceWorker):
        self.device = device
        self.is_busy = False
        self.isr_callback: Optional[Callable[[IORequest], None]] = None

    def set_isr(self, callback: Callable[[IORequest], None]):
        self.isr_callback = callback

    def start_io(self, request: IORequest):
        self.is_busy = True
        request.state = RequestState.RUNNING
        request.start_time = time.time()
        
        # Start device operation in a separate background hardware thread
        thread = threading.Thread(target=self._worker, args=(request,), daemon=True)
        thread.start()

    def _worker(self, request: IORequest):
        self.device.perform_operation(request.service_time_ms)
        self.is_busy = False
        request.end_time = time.time()
        
        # In interrupt mode, pulse the interrupt line (trigger ISR)
        if request.mode == IOMode.INTERRUPT and self.isr_callback:
            self.isr_callback(request)

class DeviceDriver:
    """Simulates OS Kernel Device Driver."""
    def __init__(self, controller: Controller):
        self.controller = controller

    def issue_command(self, request: IORequest):
        self.controller.start_io(request)

class OSiOManager:
    """Simulates the OS I/O Manager Subsystem."""
    def __init__(self, driver: DeviceDriver, controller: Controller, polling_interval_ms: int = 5):
        self.driver = driver
        self.controller = controller
        self.polling_interval_ms = polling_interval_ms
        self.completed_requests: List[IORequest] = []
        
        # OS registers ISR with hardware controller at boot
        self.controller.set_isr(self.isr)

    def isr(self, request: IORequest):
        """Interrupt Service Routine (ISR) triggered by hardware context."""
        request.state = RequestState.COMPLETE
        self.completed_requests.append(request)

    def execute_request(self, request: IORequest, log_callback: Callable):
        request.create_time = time.time()
        log_callback(f"App: I/O request created ({request.req_type.value}, {request.device}, {request.size_kb}KB)", request)
        
        log_callback("System Call: I/O invoked -> trap to kernel", request)
        log_callback("OS: request dispatched to driver", request)
        
        log_callback("Driver: command issued to controller", request)
        
        # Driver interacts with controller
        self.driver.issue_command(request)
        log_callback(f"Controller: device set to BUSY, operation started [{request.mode.value} Mode]", request)
        
        if request.mode == IOMode.POLLING:
            # Polling Loop / Busy Waiting
            while self.controller.is_busy:
                request.cpu_checks += 1
                time.sleep(self.polling_interval_ms / 1000.0)
            
            # Manually transition state as there is no interrupt
            request.state = RequestState.COMPLETE
            self.completed_requests.append(request)
            log_callback("OS: polling saw device DONE (status read), request marked COMPLETE", request)
            
        elif request.mode == IOMode.INTERRUPT:
            # Block the calling thread (simulate context switch / blocking wait)
            while request.state != RequestState.COMPLETE:
                # Simulates yielding the CPU to other processes
                time.sleep(0.001) 
                
            log_callback("ISR: interrupt received, status read, request marked COMPLETE", request)
            
        # Returning back to user space
        log_callback("OS: process unblocked, control returned to user", request)
