'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Cpu,
  Activity,
  Clock,
  CheckCircle2,
  Settings2,
  Terminal,
  BarChart3,
  HardDrive,
  Zap,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { IOMode, IOType, IOStatus, IORequest, EventLogEntry } from '../lib/types';
import { SimulationEngine } from '../lib/simulation';
import { cn } from '../lib/utils';

// --- Custom Components for Avant-Garde Aesthetic ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-sky-500/30 overflow-hidden">
        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">{label}</p>
        <p className="text-sm font-mono text-sky-400">
          {payload[0].name === 'checks' ? 'CPU CHECKS' : 'LATENCY'}: <span className="font-bold">{payload[0].value.toFixed(1)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function IOSimulatorDashboard() {
  const [requests, setRequests] = useState<IORequest[]>([]);
  const [logs, setLogs] = useState<EventLogEntry[]>([]);
  const [mode, setMode] = useState<IOMode>(IOMode.INTERRUPT);
  const [serviceTime, setServiceTime] = useState(300);
  const [isSimulating, setIsSimulating] = useState(false);

  // Persistent history for comparison
  const [history, setHistory] = useState<Record<string, { rt: number; checks: number }>>({
    ['INTERRUPT']: { rt: 0, checks: 0 },
    ['POLLING']: { rt: 0, checks: 0 }
  });

  const engineRef = useRef<SimulationEngine | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    engineRef.current = new SimulationEngine((reqs, lgs) => {
      setRequests(reqs);
      setLogs(lgs);
    });
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runSimulation = async () => {
    if (!engineRef.current || isSimulating) return;
    setIsSimulating(true);
    const result = await engineRef.current.runRequest('Disk0', IOType.READ, mode, 4.0, serviceTime);

    // Update comparison history
    if (result) {
      setHistory(prev => ({
        ...prev,
        [mode]: {
          rt: result.completionTime! - result.arrivalTime,
          checks: result.cpuChecks
        }
      }));
    }

    setIsSimulating(false);
  };

  const resetSimulation = () => {
    engineRef.current?.reset();
    setHistory({
      ['INTERRUPT']: { rt: 0, checks: 0 },
      ['POLLING']: { rt: 0, checks: 0 }
    });
    setLogs([]);
    setRequests([]);
    setIsSimulating(false);
  };

  const currentRequest = requests[requests.length - 1];

  const getAvailability = (checks: number, isSelected: boolean) => {
    // If it's the selected mode but hasn't run yet, show theoretical potential
    if (isSelected && checks === 0) return mode === IOMode.INTERRUPT ? 100 : 85;
    return Math.max(10, 100 - (checks * 4));
  };

  const chartData = [
    {
      name: 'Polling Loop',
      availability: getAvailability(history['POLLING'].checks, mode === IOMode.POLLING),
      checks: history['POLLING'].checks
    },
    {
      name: 'Interrupt-Driven',
      availability: getAvailability(history['INTERRUPT'].checks, mode === IOMode.INTERRUPT),
      checks: history['INTERRUPT'].checks
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 font-sans selection:bg-sky-500/20">
      <div className="max-w-[1600px] mx-auto relative z-10">
        <header className="flex justify-between items-end mb-12 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[2px] w-8 bg-sky-500" />
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-[0.3em]">Hardware Abstraction</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900">
              IO<span className="text-sky-500">_</span>SIMULATOR<span className="text-slate-700 text-2xl font-light ml-2">v2.1</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={resetSimulation}
              className="p-3 rounded-full hover:bg-slate-800 transition-all border border-slate-800 group"
              title="Reset State"
            >
              <RotateCcw className="w-5 h-5 text-slate-400 group-hover:rotate-[-45deg] transition-transform" />
            </button>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={cn(
                "group relative px-8 py-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-all overflow-hidden",
                isSimulating
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <div className="relative z-10 flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Run Execution
              </div>
              {!isSimulating && (
                <div className="absolute inset-0 bg-sky-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
              )}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-12 gap-6 items-start">
          {/* Dashboard Left - Metrics & Visualizer */}
          <div className="col-span-8 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <BentoMetric
                label="Latency"
                value={currentRequest?.status === IOStatus.COMPLETE ? `${(currentRequest.completionTime! - currentRequest.arrivalTime).toFixed(0)}` : '0'}
                unit="ms"
                icon={<Clock className="w-5 h-5" />}
                trend="Real-time delay"
              />
              <BentoMetric
                label="Overhead"
                value={currentRequest?.cpuChecks ?? 0}
                unit="cycles"
                icon={<Activity className="w-5 h-5" />}
                trend="Wasted CPU ops"
                color="text-purple-400"
              />
              <BentoMetric
                label="State"
                value={currentRequest?.status ?? 'IDLE'}
                unit=""
                icon={<Zap className="w-5 h-5" />}
                trend="Current Pipeline Phase"
                color={currentRequest?.status === IOStatus.RUNNING ? 'text-amber-400' : 'text-emerald-400'}
              />
            </div>

            {/* Pipeline Visual - The "Why" of the Sim */}
            <div className="bento-item h-[480px] flex flex-col p-10">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Execution Pipeline</h3>
                  <p className="text-sm text-slate-500">Sequential logic flow visualization</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  Live Stream
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between relative px-4">
                {/* Connecting Lines */}
                <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[1px] bg-slate-800" />
                <AnimatePresence>
                  {isSimulating && (
                    <motion.div
                      className="absolute left-[8%] top-1/2 -translate-y-1/2 h-[2px] bg-sky-500 shadow-[0_0_15px_#0ea5e9]"
                      initial={{ width: 0 }}
                      animate={{ width: '84%' }}
                      transition={{ duration: serviceTime / 1000, ease: "linear" }}
                    />
                  )}
                </AnimatePresence>

                <NodeNode label="App" icon={<Terminal />} active={currentRequest?.status === IOStatus.PENDING} />
                <NodeNode label="Kernel" icon={<Cpu />} active={currentRequest?.status === IOStatus.RUNNING} />
                <NodeNode label="Driver" icon={<Settings2 />} active={currentRequest?.status === IOStatus.RUNNING} />
                <NodeNode label="Physics" icon={<HardDrive />} active={currentRequest?.status === IOStatus.RUNNING} />
              </div>

              <div className="mt-12 flex justify-between text-xs text-slate-500 font-medium italic">
                <span>User Space</span>
                <span>System Call Interface</span>
                <span>Kernel Space</span>
                <span>Hardware Layer</span>
              </div>
            </div>

            {/* Console Log - High contrast, light background */}
            <div className="bento-item p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System_Event_Log</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="h-[240px] overflow-y-auto font-mono text-xs space-y-2 pr-4 custom-scrollbar">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex gap-6 border-b border-slate-100 py-2 group hover:bg-slate-50 transition-colors">
                    <span className="text-slate-400 font-bold min-w-[70px]">{(log.timestamp / 1000).toFixed(3)}s</span>
                    <span className={cn(
                      "transition-colors",
                      log.message.includes('Polling') ? 'text-amber-600' :
                        log.message.includes('ISR') || log.message.includes('interrupt') ? 'text-sky-600' :
                          'text-slate-600 group-hover:text-slate-900'
                    )}>
                      {log.message}
                    </span>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-slate-400 italic">
                    Push 'Run Execution' to initiate simulation sequence...
                  </div>
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          {/* Dashboard Right - Controls & Data */}
          <div className="col-span-4 space-y-6">
            {/* Control Panel */}
            <div className="bento-item p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-sky-500" /> Parameters
              </h3>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logic Model</span>
                    <Info className="w-3 h-3 text-slate-600 cursor-help" />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <ModeToggle
                      active={mode === IOMode.INTERRUPT}
                      onClick={() => setMode(IOMode.INTERRUPT)}
                      label="Interrupt-Driven"
                      desc="Async signaling via hardware ISR"
                      icon={<Zap className="w-4 h-4" />}
                    />
                    <ModeToggle
                      active={mode === IOMode.POLLING}
                      onClick={() => setMode(IOMode.POLLING)}
                      label="Polling Loop"
                      desc="Synchronous busy-waiting"
                      icon={<RotateCcw className="w-4 h-4" />}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Device Latency</span>
                    <span className="text-sky-500 font-mono text-sm">{serviceTime}ms</span>
                  </div>
                  <input
                    type="range" min="100" max="1000" step="50"
                    value={serviceTime}
                    onChange={(e) => setServiceTime(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <p className="text-[10px] text-slate-600 italic leading-snug">
                    Simulates physical disk rotation and hardware seek time. Higher values emphasize Polling inefficiency.
                  </p>
                </div>
              </div>
            </div>

            {/* Intelligence - Comparing the 2 models */}
            <div className="bento-item p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" /> Intelligence
              </h3>

              <div className="space-y-10">
                <div className="h-[220px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest text-center italic">CPU Availability for User App (%)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="glass-card p-3 border border-sky-500/30">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{data.name}</p>
                                <p className="text-sm font-mono text-sky-600">Availability: <span className="font-bold">{data.availability}%</span></p>
                                <p className="text-[10px] text-slate-400">Total Checks: {data.checks}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="availability" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#0284c7'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    Efficiency Insights
                    <span className="text-sky-600 font-mono">Delta</span>
                  </h4>
                  <ul className="space-y-4">
                    <InsightItem
                      title="CPU Availability Delta"
                      desc={history['POLLING'].checks > 0 || mode === IOMode.POLLING
                        ? `Polling traps the CPU in a wait-loop, reducing potential availability by ${100 - getAvailability(history['POLLING'].checks, mode === IOMode.POLLING)}%.`
                        : "Run Polling to see multi-tasking impact."}
                      value={history['POLLING'].checks > 0 || mode === IOMode.POLLING ? `-${100 - getAvailability(history['POLLING'].checks, mode === IOMode.POLLING)}%` : "0%"}
                      isNegative
                    />
                    <InsightItem
                      title="Model Efficiency Score"
                      desc={mode === IOMode.INTERRUPT ? "100% Efficiency: No wasted cycles." : "Efficiency dropped due to synchronous waiting."}
                      value={mode === IOMode.INTERRUPT ? "100/100" : `${Math.max(20, 100 - (history['POLLING'].checks * 8 || 15))}/100`}
                      isPositive={mode === IOMode.INTERRUPT}
                      isNegative={mode === IOMode.POLLING}
                    />
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Internal UI Fragments ---

function BentoMetric({ label, value, unit, icon, trend, color = "text-sky-600" }: any) {
  return (
    <div className="bento-item p-6 group hover:translate-y-[-2px]">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm", color)}>
          {icon}
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{trend}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <h4 className="text-3xl font-black text-slate-900">{value}</h4>
        <span className="text-sm font-medium text-slate-400">{unit}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{label}</p>
    </div>
  );
}

function NodeNode({ label, icon, active }: any) {
  return (
    <div className="flex flex-col items-center gap-4 relative z-10">
      <motion.div
        animate={active ? {
          scale: [1, 1.05, 1],
          boxShadow: ["0 0 0px rgba(14, 165, 233, 0.2)", "0 0 20px rgba(14, 165, 233, 0.4)", "0 0 0px rgba(14, 165, 233, 0.2)"]
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border",
          active ? "bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-200" : "bg-white border-slate-100 text-slate-400"
        )}
      >
        {React.cloneElement(icon, { size: 28 })}
      </motion.div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest transition-colors",
        active ? "text-sky-600" : "text-slate-400"
      )}>
        {label}
      </span>
    </div>
  );
}

function ModeToggle({ active, onClick, label, desc, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
        active
          ? "bg-sky-50 border-sky-200 ring-2 ring-sky-100 shadow-sm"
          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-lg transition-colors",
        active ? "bg-sky-600 text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-500"
      )}>
        {icon}
      </div>
      <div>
        <div className={cn("text-xs font-bold uppercase tracking-widest", active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700")}>
          {label}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

function InsightItem({ title, desc, value, isPositive, isNegative }: any) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/30">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {isPositive ? <Zap className="w-3 h-3 text-emerald-500" /> : <Info className="w-3 h-3 text-sky-500" />}
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{title}</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
      </div>
      {value && (
        <span className={cn(
          "text-xs font-mono font-bold",
          isPositive ? "text-emerald-600" : isNegative ? "text-amber-600" : "text-slate-400"
        )}>
          {value}
        </span>
      )}
    </div>
  );
}
