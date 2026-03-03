from models import IORequest, IOType, IOMode
from components import Logger, OSIOManager
from visualization import generate_comparison_charts, print_interrupt_flowchart, print_metrics_table
import time

def run_simulation_demo():
    logger = Logger()
    manager = OSIOManager(logger)
    
    # Setup devices
    # Disk0 is slow, Printer1 is faster
    manager.register_device("Disk0", 300) # 300ms service time
    manager.register_device("Printer1", 100) # 100ms service time
    
    print("\n--- OS I/O Simulation Demo Starting ---")
    print("Mode 1: Interrupt-driven I/O")
    
    req1 = IORequest(1, "Disk0", IOType.READ, IOMode.INTERRUPT, 4.0)
    manager.syscall_io(req1)
    
    print("\nMode 2: Polling-based I/O")
    req2 = IORequest(2, "Disk0", IOType.READ, IOMode.POLLING, 4.0)
    manager.syscall_io(req2)
    
    # Run a small batch for better stats
    print("\n--- Running Batch Comparison ---")
    for i in range(3, 6):
        m = IOMode.INTERRUPT if i % 2 == 0 else IOMode.POLLING
        req = IORequest(i, "Printer1", IOType.WRITE, m, 2.0)
        manager.syscall_io(req)
        time.sleep(0.1)

    # Final outputs
    print_interrupt_flowchart()
    print_metrics_table(manager.completed_requests)
    
    print("\nGenerating visual comparison charts...")
    generate_comparison_charts(manager.completed_requests)

if __name__ == "__main__":
    run_simulation_demo()
