# OS I/O Request Handling Simulator

Design, Simulation and Performance Analysis of an OS I/O Request Handling Simulator (Polling vs Interrupt-Driven I/O).

## Overview
This conceptual execution simulator demonstrates how an Operating System handles I/O requests through the complete pipeline: 
`Application → System Call → Device Driver → Controller → I/O Device`. 

It clearly visualizes the behavioral and performance contrast between **Polling-based I/O** (busy waiting) and **Interrupt-driven I/O**.

## Project Architecture
- `models.py`: Data structures for `IORequest`, `IOMode`, and `IOStatus`.
- `components.py`: Core simulation logic involving the Kernel, Driver, Controller, and Device hardware.
- `visualization.py`: Utilities for generating ASCII flowcharts and Matplotlib charts.
- `main.py`: Interactive CLI entry point to run the demonstration.

## Setup & Run

### Prerequisites
You need Python 3.x installed. For the visual charts, `matplotlib` is required.
```bash
pip install matplotlib
```

### Running the Simulator
```bash
cd "C:\Users\starl\woxsen\SEM 4\OS\io_simulator"
python main.py
```

## Expected Outputs
1. **Timestamped Event Timeline**: Prints every micro-step of an I/O request flowing through the system.
2. **Interrupt Handling Flowchart**: Visual ASCII flowchart showing ISR sequence.
3. **Performance Dashboard**: Terminal output showing wasted CPU instructions vs response time.
4. **Graphical Comparison**: `comparison_chart.png` is generated, summarizing the Polling vs Interrupt improvements graphically.
