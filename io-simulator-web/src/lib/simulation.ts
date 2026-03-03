import { IOMode, IOStatus, IOType, IORequest, EventLogEntry } from './types';

export class SimulationEngine {
    private requests: IORequest[] = [];
    private logs: EventLogEntry[] = [];
    private startTime: number = Date.now();
    private onUpdate: (requests: IORequest[], logs: EventLogEntry[]) => void;

    constructor(onUpdate: (requests: IORequest[], logs: EventLogEntry[]) => void) {
        this.onUpdate = onUpdate;
    }

    private log(message: string, requestId?: number) {
        const timestamp = Date.now() - this.startTime;
        this.logs = [...this.logs, { timestamp, message, requestId }];
        this.onUpdate([...this.requests], [...this.logs]);
    }

    async runRequest(
        deviceId: string,
        type: IOType,
        mode: IOMode,
        sizeKb: number,
        serviceTimeMs: number
    ) {
        const id = this.requests.length + 1;
        const request: IORequest = {
            id,
            type,
            deviceId,
            sizeKb,
            mode,
            status: IOStatus.PENDING,
            arrivalTime: Date.now(),
            cpuChecks: 0,
        };

        this.requests = [...this.requests, request];
        this.log(`App: I/O request created (${type}, ${deviceId}, ${sizeKb}KB)`, id);

        // Trap to kernel
        await this.delay(50);
        this.log(`System Call: ${type.toLowerCase()}() invoked -> trap to kernel`, id);

        await this.delay(50);
        this.log(`OS: request dispatched to driver`, id);

        await this.delay(50);
        this.log(`Driver: command issued to controller for ${deviceId}`, id);

        // Start device operation
        request.status = IOStatus.RUNNING;
        request.startTime = Date.now();
        this.log(`Controller: device set to BUSY, operation started on ${deviceId}`, id);

        if (mode === IOMode.POLLING) {
            // Polling mode simulation
            const pollingInterval = 50;
            const totalIterations = serviceTimeMs / pollingInterval;

            for (let i = 0; i < totalIterations; i++) {
                await this.delay(pollingInterval);
                request.cpuChecks++;
                this.log(`OS (Polling): CPU checking device status... (Check #${request.cpuChecks})`, id);
            }

            this.log(`Controller: device DONE on ${deviceId} -> status bit updated`, id);
        } else {
            // Interrupt mode simulation
            await this.delay(serviceTimeMs);
            this.log(`Controller: device DONE on ${deviceId} -> interrupt raised`, id);

            await this.delay(20);
            this.log(`ISR: interrupt received, status read, request ${id} marked COMPLETE`, id);
        }

        request.status = IOStatus.COMPLETE;
        request.completionTime = Date.now();
        this.log(`OS: process unblocked, control returned to user`, id);

        return request;
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset() {
        this.requests = [];
        this.logs = [];
        this.startTime = Date.now();
        this.onUpdate([], []);
    }
}
