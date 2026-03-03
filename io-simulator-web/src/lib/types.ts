export enum IOMode {
    POLLING = 'POLLING',
    INTERRUPT = 'INTERRUPT',
}

export enum IOType {
    READ = 'READ',
    WRITE = 'WRITE',
}

export enum IOStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETE = 'COMPLETE',
}

export interface IORequest {
    id: number;
    type: IOType;
    deviceId: string;
    sizeKb: number;
    mode: IOMode;
    status: IOStatus;
    arrivalTime: number;
    startTime?: number;
    completionTime?: number;
    cpuChecks: number;
}

export interface EventLogEntry {
    timestamp: number;
    message: string;
    requestId?: number;
}
