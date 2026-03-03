# OS I/O Request Handling Simulator (v2.1)

Design, Simulation and Performance Analysis of an OS I/O Request Handling Simulator featuring an Advanced Web UI and a Legacy CLI.

## 🚀 Interactive Web UI
The project now includes a premium, avant-garde web dashboard that visualizes the I/O pipeline and performance deltas in real-time.

**Key Features:**
- **Dynamic Pipeline Visualization**: Live animation of requests moving from App to Hardware.
- **Intelligence Analytics**: CPU Availability comparison and Efficiency Scoring.
- **System Event Log**: Real-time telemetry feed from the kernel.

For a detailed list of all capabilities, see [FEATURES.md](./FEATURES.md).
For the technical system design and block flow, see [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

### Running the Web UI
```bash
cd "C:\Users\starl\woxsen\SEM 4\OS\io_simulator\io-simulator-web"
npm install
npm run dev
```
Navigate to `http://localhost:3000`.

## 🖥️ Legacy CLI
The original Python-based simulator is preserved in the `cli-version` branch and locally in the root directory.

### Running the CLI
```bash
cd "C:\Users\starl\woxsen\SEM 4\OS\io_simulator"
python main.py
```

## 🏗️ Project Architecture
- `io-simulator-web/`: Modern Next.js application (App, Logic, Components).
- `models.py`: Python data structures for CLI.
- `components.py`: Core simulation logic for CLI.
- `visualization.py`: CLI-based charting utilities.
- `main.py`: CLI entry point.

## 📊 Expected Outputs
1. **CPU Availability Analysis**: High-contrast visual comparison of multitasking capacity.
2. **Efficiency Delta**: Logical proof of why Interrupts outperform Polling.
3. **Real-time Pipeline Tracking**: Step-by-step visual audit of hardware abstraction.
