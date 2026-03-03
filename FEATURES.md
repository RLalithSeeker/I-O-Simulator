# IO_SIMULATOR: Feature Documentation

A comprehensive guide to the advanced OS I/O Handling Simulator's capabilities and architecture.

## 1. Core Simulation Engine
The simulation engine faithfully recreates the logic of a modern Operating System kernel's I/O subsystem.

*   **Interrupt-Driven I/O**: Simulates asynchronous signaling. The CPU dispatches the command and immediately returns to the "User App" state, achieving ~100% efficiency.
*   **Polling Loop I/O**: Simulates synchronous "busy-waiting". The CPU periodically checks the hardware status bit, consuming cycles and reducing multitasking availability.

## 2. Real-Time Visualization
*   **Execution Pipeline**: A dynamic, animated flow showing the lifecycle of an I/O request through App Space, Kernel Space, Driver Layer, and Physical Hardware.
*   **Packet Streaming**: Visual representation of "trap-to-kernel" and "ISR" (Interrupt Service Routine) handling.

## 3. High-Fidelity Bento Metrics
The dashboard features high-contrast metrics for immediate performance assessment:
*   **Latency**: Measures total round-trip time (ms) from request to completion.
*   **CPU Overhead**: Tracks wasted cycles spent in polling loops.
*   **Pipeline State**: Live status indicator (IDLE, PENDING, RUNNING, COMPLETE).

## 4. Advanced Intelligence & Analytics
*   **CPU Availability Graph**: A comparative chart showing how much CPU time is actually available for user-space applications.
*   **Model Efficiency Score**: A 0-100 rating derived from the ratio of productive work vs. administrative overhead.
*   **Efficiency Insights**: Dynamic delta analysis that calculates exactly how much multitasking capacity is lost during polling.

## 5. System Event Log
A high-contrast, high-speed telemetry feed that chronicles every system-level event:
*   Sub-millisecond timestamping.
*   Color-coded signaling for Polling checks vs. ISR triggers.
*   Auto-scrolling terminal aesthetic.

## 6. Premium Control Panel
*   **Logic Model Toggle**: Seamlessly switch between I/O strategies.
*   **Device Latency Slider**: Simulate physical hardware speeds (100ms - 1000ms) to observe how longer delays exponentially penalize polling inefficiency.
*   **State Reset**: Instantly clear history and logs for fresh experimentation.

---
*Developed for advanced OS architectural study.*
