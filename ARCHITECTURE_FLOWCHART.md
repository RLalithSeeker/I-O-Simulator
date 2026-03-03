# I/O System Architecture Flowchart

This diagram illustrates the step-by-step lifecycle of an I/O request as it moves through the Operating System and Hardware layers.

```mermaid
graph TD
    subgraph "User Space"
        A["Application (User App)"]
    end

    subgraph "Kernel Space (OS)"
        B["System Call Interface (SCI)"]
        C["I/O Subsystem (Kernel)"]
        D["Device Driver"]
    end

    subgraph "Hardware Layer"
        E["I/O Controller"]
        F["Physical Hardware (e.g. Disk)"]
    end

    %% Workflow
    A -->|"1. Request (read/write)"| B
    B -->|"2. Trap to Kernel"| C
    C -->|"3. Execute Driver Logic"| D
    D -->|"4. Send to Controller"| E
    E -->|"5. Mechanical/Physical Ops"| F

    %% Resolution Logic
    F -- "6. Operation Complete" --> E
    
    %% Mode Differences
    E -- "POLLING: CPU sits in wait-loop" --> D
    E -- "INTERRUPT: Hardware sends IRQ signal" --> C
    
    C -- "7. Return Data/Status" --> B
    B -- "8. Resume Execution" --> A

    %% Styling
    style A fill:#sky-50,stroke:#0ea5e9,stroke-width:2px
    style B fill:#f8fafc,stroke:#64748b
    style C fill:#f0f9ff,stroke:#0ea5e9
    style D fill:#f0f9ff,stroke:#0ea5e9
    style E fill:#fffbeb,stroke:#f59e0b
    style F fill:#fffbeb,stroke:#f59e0b
```

### Flowchart Legend
*   **User Space**: Where your applications live.
*   **Kernel Space**: The protected heart of the Operating System.
*   **Hardware Layer**: The physical devices (Platters, Motors, Circuits).
*   **Polling Loop**: The "Are we there yet?" stage where the Driver waits.
*   **Interrupt Signal (IRQ)**: The "Doorbell" that notifies the Kernel when the job is done.
