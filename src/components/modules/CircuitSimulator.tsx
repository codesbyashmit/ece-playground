"use client";

import { useState, useEffect } from "react";
import { Zap, AlertTriangle } from "lucide-react";

type ComponentType = "wire" | "resistor" | "led";

interface CircuitSlot {
  id: string;
  type: ComponentType;
  value: number;
  label: string;
}

export default function CircuitSimulator() {
  const [voltage, setVoltage] = useState<number>(9);
  
  const [slots, setSlots] = useState<Record<string, CircuitSlot>>({
    top: { id: "top", type: "resistor", value: 330, label: "R1" },
    right: { id: "right", type: "led", value: 10, label: "D1" }, 
    bottom: { id: "bottom", type: "wire", value: 0, label: "W1" },
  });

  const [current, setCurrent] = useState<number>(0);
  const [rTotal, setRTotal] = useState<number>(0);
  const [status, setStatus] = useState<"OK" | "SHORT" | "OVERLOAD">("OK");
  useEffect(() => {
    let resistance = 0;
    let ledVoltageDrop = 0;
    let ledCount = 0;

    Object.values(slots).forEach((slot) => {
      resistance += slot.value;
      if (slot.type === "led") {
        ledVoltageDrop += 2.0; 
        ledCount += 1;
      }
    });

    setRTotal(resistance);
    const activeVoltage = voltage - ledVoltageDrop;

    if (resistance === 0 && activeVoltage > 0) {
      setCurrent(99.99); 
      setStatus("SHORT");
    } else if (activeVoltage <= 0) {
      setCurrent(0); 
      setStatus("OK");
    } else {
      const calcCurrent = activeVoltage / resistance;
      setCurrent(calcCurrent);
            if (calcCurrent > 0.03 && ledCount > 0) {
        setStatus("OVERLOAD");
      } else {
        setStatus("OK");
      }
    }
  }, [voltage, slots]);

  const handleComponentChange = (slotId: string, type: ComponentType) => {
    setSlots(prev => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        type,
        value: type === "resistor" ? 330 : type === "led" ? 10 : 0
      }
    }));
  };

  const handleValueChange = (slotId: string, value: number) => {
    setSlots(prev => ({
      ...prev,
      [slotId]: { ...prev[slotId], value }
    }));
  };
  const flowSpeed = current === 0 ? "0s" : status === "SHORT" ? "0.2s" : `${Math.max(0.5, 3 - (current * 50))}s`;
  const isFlowing = current > 0 && status !== "OVERLOAD";

  return (
    <div className="flex flex-col h-full gap-6">
      
      <div className="flex justify-between items-end border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">DC Circuit Sandbox</h2>
          <p className="text-neutral-500 text-sm">Ohm&apos;s Law & KVL Interactive Solver</p>
        </div>
        
        <div className="flex flex-col items-end gap-1 font-mono text-xs text-right">
          <div className="text-white mb-1 uppercase tracking-widest text-[10px]">Live Telemetry</div>
          <div className="text-cyan-400">I = V / R</div>
          <div className={status === "SHORT" || status === "OVERLOAD" ? "text-red-500 font-bold" : "text-neutral-400"}>
            STATUS: {status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[450px]">
        
        <div className="lg:col-span-2 border border-neutral-800 bg-[#050505] rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex items-center justify-center p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

          {status === "SHORT" && (
            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center z-20 pointer-events-none animate-pulse">
              <div className="bg-red-500/20 border border-red-500 text-red-500 px-6 py-3 font-mono font-bold tracking-widest flex items-center gap-3 backdrop-blur-md">
                <AlertTriangle className="w-6 h-6" /> SHORT CIRCUIT DETECTED
              </div>
            </div>
          )}

          {status === "OVERLOAD" && (
            <div className="absolute inset-0 bg-orange-500/10 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-orange-500/20 border border-orange-500 text-orange-500 px-6 py-3 font-mono font-bold tracking-widest flex items-center gap-3 backdrop-blur-md">
                <AlertTriangle className="w-6 h-6" /> COMPONENT OVERLOAD (BURN OUT)
              </div>
            </div>
          )}

          <svg viewBox="0 0 400 300" className="w-full max-w-lg h-auto relative z-10 drop-shadow-[0_0_10px_rgba(0,245,212,0.2)]">
            
            <path d="M 50,150 L 50,50 L 350,50 L 350,250 L 50,250 Z" fill="none" stroke="#222" strokeWidth="4" />
            
            {isFlowing && (
              <path 
                d="M 50,150 L 50,50 L 350,50 L 350,250 L 50,250 L 50,150" 
                fill="none" 
                stroke={status === "SHORT" ? "#ef233c" : "#00f5d4"} 
                strokeWidth="4" 
                strokeDasharray="10 15"
                className="animate-[flow_linear_infinite]"
                style={{ animationDuration: flowSpeed }}
              />
            )}
            <g transform="translate(50, 150)">
              <rect x="-20" y="-30" width="40" height="60" fill="#111" stroke="#444" strokeWidth="2" />
              <line x1="-15" y1="-10" x2="15" y2="-10" stroke="#00f5d4" strokeWidth="3" /> {/* Positive (Long) */}
              <line x1="-8" y1="10" x2="8" y2="10" stroke="#444" strokeWidth="4" /> {/* Negative (Short) */}
              <text x="30" y="5" fill="#fff" fontSize="14" fontFamily="monospace" fontWeight="bold">{voltage}V</text>
              <text x="-25" y="-15" fill="#00f5d4" fontSize="12" fontFamily="monospace">+</text>
            </g>
            <g transform="translate(200, 50)">
              <rect x="-40" y="-20" width="80" height="40" fill="#0a0a0f" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
              {slots.top.type === "resistor" && <path d="M -30,0 L -20,-10 L -10,10 L 0,-10 L 10,10 L 20,-10 L 30,0" fill="none" stroke="#fff" strokeWidth="3" />}
              {slots.top.type === "led" && (
                <g>
                  <polygon points="-10,-15 10,0 -10,15" fill={isFlowing ? "#00f5d4" : "#333"} />
                  <line x1="10" y1="-15" x2="10" y2="15" stroke={isFlowing ? "#00f5d4" : "#333"} strokeWidth="3" />
                  {isFlowing && <path d="M 5,-20 L 15,-30 M 15,-20 L 25,-30" fill="none" stroke="#00f5d4" strokeWidth="2" />}
                </g>
              )}
              {slots.top.type === "wire" && <line x1="-40" y1="0" x2="40" y2="0" stroke="#fff" strokeWidth="4" />}
            </g>
            <g transform="translate(350, 150) rotate(90)">
              <rect x="-40" y="-20" width="80" height="40" fill="#0a0a0f" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
              {slots.right.type === "resistor" && <path d="M -30,0 L -20,-10 L -10,10 L 0,-10 L 10,10 L 20,-10 L 30,0" fill="none" stroke="#fff" strokeWidth="3" />}
              {slots.right.type === "led" && (
                <g>
                  <polygon points="-10,-15 10,0 -10,15" fill={isFlowing ? "#f15bb5" : "#333"} />
                  <line x1="10" y1="-15" x2="10" y2="15" stroke={isFlowing ? "#f15bb5" : "#333"} strokeWidth="3" />
                  {isFlowing && <path d="M 5,-20 L 15,-30 M 15,-20 L 25,-30" fill="none" stroke="#f15bb5" strokeWidth="2" />}
                </g>
              )}
              {slots.right.type === "wire" && <line x1="-40" y1="0" x2="40" y2="0" stroke="#fff" strokeWidth="4" />}
            </g>
            <g transform="translate(200, 250) rotate(180)">
              <rect x="-40" y="-20" width="80" height="40" fill="#0a0a0f" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
              {slots.bottom.type === "resistor" && <path d="M -30,0 L -20,-10 L -10,10 L 0,-10 L 10,10 L 20,-10 L 30,0" fill="none" stroke="#fff" strokeWidth="3" />}
              {slots.bottom.type === "led" && (
                <g>
                  <polygon points="-10,-15 10,0 -10,15" fill={isFlowing ? "#f4a261" : "#333"} />
                  <line x1="10" y1="-15" x2="10" y2="15" stroke={isFlowing ? "#f4a261" : "#333"} strokeWidth="3" />
                  {isFlowing && <path d="M 5,-20 L 15,-30 M 15,-20 L 25,-30" fill="none" stroke="#f4a261" strokeWidth="2" />}
                </g>
              )}
              {slots.bottom.type === "wire" && <line x1="-40" y1="0" x2="40" y2="0" stroke="#fff" strokeWidth="4" />}
            </g>

          </svg>
        </div>

        <div className="flex flex-col gap-4 border border-neutral-800 bg-[#0a0a0f] rounded-sm p-6">
          
          <div className="bg-[#111115] border border-neutral-800 p-4 font-mono text-sm shadow-inner">
            <div className="text-neutral-500 mb-2 uppercase tracking-widest text-[10px]">Diagnostics</div>
            <div className="flex justify-between border-b border-neutral-800 pb-1 mb-1">
              <span className="text-neutral-400">Current (I)</span>
              <span className={status === "SHORT" ? "text-red-500 font-bold" : "text-cyan-400"}>
                {(current * 1000).toFixed(1)} mA
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-1 mb-1">
              <span className="text-neutral-400">Total Resistance (R)</span>
              <span className="text-white">{rTotal} Ω</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Power (P=VI)</span>
              <span className="text-magenta-400">{(voltage * current).toFixed(2)} W</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs text-neutral-400 uppercase font-semibold tracking-widest flex justify-between">
              <span>Source Voltage</span>
              <span className="text-white">{voltage} V</span>
            </label>
            <input 
              type="range" min="0" max="24" step="1" 
              value={voltage} onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="h-px w-full bg-neutral-800 my-2" />

          {Object.entries(slots).map(([key, slot]) => (
            <div key={key} className="flex flex-col gap-2 bg-[#111115] p-3 border border-neutral-800 rounded-sm">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                <span className="text-neutral-500 font-bold">{key} SLOT</span>
                <select 
                  className="bg-black border border-neutral-700 text-white p-1 outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                  value={slot.type}
                  onChange={(e) => handleComponentChange(key, e.target.value as ComponentType)}
                >
                  <option value="wire">Wire (Short)</option>
                  <option value="resistor">Resistor</option>
                  <option value="led">LED Diode</option>
                </select>
              </div>
              
              {slot.type === "resistor" && (
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="range" min="10" max="2000" step="10" 
                    value={slot.value} onChange={(e) => handleValueChange(key, Number(e.target.value))}
                    className="flex-1 accent-white cursor-pointer"
                  />
                  <span className="font-mono text-xs text-white min-w-[50px] text-right">{slot.value} Ω</span>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}