import matplotlib.pyplot as plt
import numpy as np
from typing import List
from models import IORequest, IOMode

def generate_comparison_charts(requests: List[IORequest]):
    polling_reqs = [r for r in requests if r.mode == IOMode.POLLING]
    interrupt_reqs = [r for r in requests if r.mode == IOMode.INTERRUPT]
    
    # 1. CPU Checks Comparison
    avg_polling_checks = np.mean([r.cpu_checks for r in polling_reqs]) if polling_reqs else 0
    avg_interrupt_checks = np.mean([r.cpu_checks for r in interrupt_reqs]) if interrupt_reqs else 0
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    ax1.bar(['Polling', 'Interrupt'], [avg_polling_checks, avg_interrupt_checks], color=['orange', 'skyblue'])
    ax1.set_title('Avg CPU Checks (Wasted Cycles)')
    ax1.set_ylabel('Count')
    
    # 2. Avg Response Time Comparison
    avg_polling_rt = np.mean([r.response_time for r in polling_reqs]) if polling_reqs else 0
    avg_interrupt_rt = np.mean([r.response_time for r in interrupt_reqs]) if interrupt_reqs else 0
    
    ax2.bar(['Polling', 'Interrupt'], [avg_polling_rt, avg_interrupt_rt], color=['orange', 'skyblue'])
    ax2.set_title('Avg Response Time (ms)')
    ax2.set_ylabel('Time (ms)')
    
    plt.tight_layout()
    plt.show()

def print_interrupt_flowchart():
    flowchart = """
    Interrupt Handling Flowchart (ISR View)
    ========================================
    [ Device Operation Complete ]
                |
                v
    [ Controller: Raise Interrupt Signal ]
                |
                v
    [ CPU: Save Context -> Jump to ISR ]
                |
                v
    [ ISR: Read Device Status (DONE) ]
                |
                v
    [ Kernel: Mark Request COMPLETE ]
                |
                v
    [ Kernel: Wake Waiting Process ]
                |
                v
    [ CPU: Restore Context -> Return ]
    """
    print(flowchart)

def print_metrics_table(requests: List[IORequest]):
    print("\nPerformance Comparison Summary:")
    print("-" * 65)
    print(f"{'Mode':<15} | {'Avg RT (ms)':<15} | {'CPU Checks':<15} | {'Efficiency':<10}")
    print("-" * 65)
    
    for mode in [IOMode.POLLING, IOMode.INTERRUPT]:
        mode_reqs = [r for r in requests if r.mode == mode]
        if not mode_reqs:
            continue
            
        avg_rt = np.mean([r.response_time for r in mode_reqs])
        avg_checks = np.mean([r.cpu_checks for r in mode_reqs])
        efficiency = "High" if mode == IOMode.INTERRUPT else "Low (Busy Wait)"
        
        print(f"{mode.name:<15} | {avg_rt:<15.2f} | {avg_checks:<15.1f} | {efficiency:<10}")
    print("-" * 65)
