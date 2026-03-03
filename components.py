import threading
import time
from datetime import datetime
from typing import List, Callable, Dict
from models import IORequest, IOStatus, IOMode

class Logger:
    def __init__(self):
        self.events: List[str] = []
        self.start_time = time.time()

    def log(self, message: str):
        rel_time = (time.time() - self.start_time) * 1000
        timestamped_msg = f"t={rel_time:0.1f}ms  {message}"
        self.events.append(timestamped_msg)
        print(timestamped_msg)

    def get_logs(self) -> List[str]:
        return self.events

class IODevice(threading.Thread):
    def __init__(self, device_id: str, service_time_ms: float, on_complete: Callable):
        super().__init__(daemon=True)
        self.device_id = device_id
        self.service_time_ms = service_time_ms
        self.on_complete = on_complete
        self.request: IORequest = None
        self._stop_event = threading.Event()

    def run(self):
        while not self._stop_event.is_set():
            if self.request and self.request.status == IOStatus.RUNNING:
                # Simulate work
                time.sleep(self.service_time_ms / 1000.0)
                self.request.status = IOStatus.COMPLETE
                self.request.completion_time = time.time()
                self.on_complete(self.request)
                self.request = None
            time.sleep(0.01)

    def process_request(self, request: IORequest):
        self.request = request
        self.request.status = IOStatus.RUNNING
        self.request.start_time = time.time()

class IOController:
    def __init__(self, logger: Logger, device: IODevice):
        self.logger = logger
        self.device = device
        self.busy = False
        self.interrupt_callback = None

    def handle_command(self, request: IORequest, callback: Callable = None):
        self.busy = True
        self.interrupt_callback = callback
        self.logger.log(f"Controller: device set to BUSY, operation started on {request.device_id}")
        self.device.process_request(request)

    def signal_completion(self, request: IORequest):
        self.busy = False
        self.logger.log(f"Controller: device DONE on {request.device_id} -> {'interrupt raised' if request.mode == IOMode.INTERRUPT else 'status bit updated'}")
        if request.mode == IOMode.INTERRUPT and self.interrupt_callback:
            self.interrupt_callback(request)

class DeviceDriver:
    def __init__(self, logger: Logger, controller: IOController):
        self.logger = logger
        self.controller = controller

    def issue_command(self, request: IORequest, callback: Callable = None):
        self.logger.log(f"Driver: command issued to controller for {request.device_id}")
        self.controller.handle_command(request, callback)

class OSIOManager:
    def __init__(self, logger: Logger):
        self.logger = logger
        self.devices: Dict[str, IODevice] = {}
        self.controllers: Dict[str, IOController] = {}
        self.drivers: Dict[str, DeviceDriver] = {}
        self.completed_requests: List[IORequest] = []

    def register_device(self, device_id: str, service_time_ms: float):
        device = IODevice(device_id, service_time_ms, self.on_device_completion)
        controller = IOController(self.logger, device)
        driver = DeviceDriver(self.logger, controller)
        
        self.devices[device_id] = device
        self.controllers[device_id] = controller
        self.drivers[device_id] = driver
        
        device.start()

    def on_device_completion(self, request: IORequest):
        self.controllers[request.device_id].signal_completion(request)

    def syscall_io(self, request: IORequest):
        self.logger.log(f"App: I/O request created ({request.io_type.name}, {request.device_id}, {request.size_kb}KB)")
        self.logger.log(f"System Call: {request.io_type.name.lower()}() invoked -> trap to kernel")
        
        driver = self.drivers.get(request.device_id)
        if not driver:
            self.logger.log(f"Error: Device {request.device_id} not found")
            return

        self.logger.log(f"OS: request dispatched to driver")
        
        if request.mode == IOMode.INTERRUPT:
            driver.issue_command(request, self.isr)
            # Simulate blocking wait (simplified)
            while request.status != IOStatus.COMPLETE:
                time.sleep(0.01)
        else:
            # Polling mode
            driver.issue_command(request)
            while self.controllers[request.device_id].busy:
                request.cpu_checks += 1
                self.logger.log(f"OS (Polling): CPU checking device status... (Check #{request.cpu_checks})")
                time.sleep(0.05) # Polling interval
        
        self.logger.log(f"OS: process unblocked, control returned to user")
        self.completed_requests.append(request)

    def isr(self, request: IORequest):
        self.logger.log(f"ISR: interrupt received, status read, request {request.request_id} marked COMPLETE")
