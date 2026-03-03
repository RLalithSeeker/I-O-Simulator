import matplotlib.pyplot as plt
import os
from typing import List
from simulator import IOMode, IORequest

def plot_comparison(polling_reqs: List[IORequest], interrupt_reqs: List[IORequest]):
    # Extract Metrics
    poll_checks = sum(r.cpu_checks for r in polling_reqs)
    int_checks = sum(r.cpu_checks for r in interrupt_reqs)
    
    poll_times = [(r.end_time - r.start_time) * 1000 for r in polling_reqs]
    int_times = [(r.end_time - r.start_time) * 1000 for r in interrupt_reqs]
    
    avg_poll_time = sum(poll_times) / len(poll_times) if poll_times else 0
    avg_int_time = sum(int_times) / len(int_times) if int_times else 0

    # Ensure styles are clean
    plt.style.use('bmh')
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle('OS I/O Performance: Polling vs Interrupt-Driven', fontsize=16, fontweight='bold')
    
    labels = ['Polling Mode', 'Interrupt Mode']
    colors = ['#e74c3c', '#2ecc71']

    # 1. CPU Checks Bar Chart
    bars1 = ax1.bar(labels, [poll_checks, int_checks], color=colors, edgecolor='black')
    ax1.set_title("Total CPU Status Checks\n(Busy Waiting Wastes CPU)", fontsize=12)
    ax1.set_ylabel("Number of Checks")
    
    # Add values on top of bars
    for bar in bars1:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2, yval + (poll_checks*0.02 if poll_checks>0 else 1), 
                 int(yval), ha='center', va='bottom', fontweight='bold')
        
    # 2. Response Time Bar Chart
    bars2 = ax2.bar(labels, [avg_poll_time, avg_int_time], color=['#3498db', '#9b59b6'], edgecolor='black')
    ax2.set_title("Average Response Time\n(Lower is better)", fontsize=12)
    ax2.set_ylabel("Time (ms)")
    
    # Add values on top of bars
    for bar in bars2:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2, yval + (avg_poll_time*0.02 if avg_poll_time>0 else 1), 
                 f"{yval:.1f} ms", ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    
    # Save chart
    output_path = os.path.join(os.path.dirname(__file__), "comparison_chart.png")
    plt.savefig(output_path, dpi=300)
    print(f"\n[+] Performance comparison chart saved to: {output_path}")
