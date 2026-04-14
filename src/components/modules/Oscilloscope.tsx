"use client";

import { useEffect, useRef, useState } from "react";

type WaveType = "sine" | "square" | "sawtooth" | "triangle" | "noise";

export default function Oscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [freq, setFreq] = useState(5);
  const [amp, setAmp] = useState(80); 
  const [waveType, setWaveType] = useState<WaveType>("sine");

  const paramsRef = useRef({ freq, amp, waveType });
  
  useEffect(() => {
    paramsRef.current = { freq, amp, waveType };
  }, [freq, amp, waveType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = container.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });
    
    resizeObserver.observe(container);

    const draw = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const centerY = height / 2;
      const { freq, amp, waveType } = paramsRef.current;

      // At 100% amp, the wave will take up 90% of the space (leaving a 10% margin)
      const maxPixelAmp = (height / 2) * 0.9;
      const pixelAmp = (amp / 100) * maxPixelAmp;

      ctx.fillStyle = "rgba(10, 10, 15, 0.25)";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
      for (let i = 0; i < height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "#00f5d4"; 
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#00f5d4";

      for (let x = 0; x < width; x++) {
        const t = (x / width) * 10 + time; 
        let y = 0;
        switch (waveType) {
          case "sine": y = Math.sin(t * freq); break;
          case "square": y = Math.sign(Math.sin(t * freq)); break;
          case "sawtooth": y = 2 * ((t * freq) - Math.floor(t * freq + 0.5)); break;
          case "triangle": y = 1 - 4 * Math.abs(Math.round(t * freq - 0.25) - (t * freq - 0.25)); break;
          case "noise": y = (Math.random() * 2 - 1); break;
        }
        const plotY = centerY - (y * pixelAmp);
        if (x === 0) ctx.moveTo(x, plotY);
        else ctx.lineTo(x, plotY);
      }
      ctx.stroke();
      
      ctx.shadowBlur = 0; 
      time -= 0.02; 
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Signal Generator</h2>
          <p className="text-neutral-500 text-sm">Real-time waveform synthesis & analysis</p>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="w-full flex-1 min-h-[400px] border border-neutral-800 bg-[#0a0a0f] relative overflow-hidden rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        
        <div className="absolute top-4 left-4 text-cyan-400 text-xs font-mono select-none pointer-events-none">
          <div>CH1: {waveType.toUpperCase()}</div>
          <div>FREQ: {freq.toFixed(1)} Hz</div>
          <div>Vpp: {((amp / 100) * 10).toFixed(1)} V</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#111115] border border-neutral-800 p-6 rounded-sm">
        <div className="flex flex-col gap-4">
          <label className="text-xs text-neutral-400 uppercase font-semibold tracking-widest">Waveform</label>
          <div className="flex flex-wrap gap-2">
            {(["sine", "square", "sawtooth", "triangle", "noise"] as WaveType[]).map((type) => (
              <button
                key={type}
                onClick={() => setWaveType(type)}
                className={`px-3 py-1.5 text-xs uppercase border transition-colors ${
                  waveType === type 
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" 
                    : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-xs text-neutral-400 uppercase font-semibold tracking-widest">
            <label>Frequency</label>
            <span className="text-white">{freq.toFixed(1)} Hz</span>
          </div>
          <input 
            type="range" min="1" max="20" step="0.1" 
            value={freq} onChange={(e) => setFreq(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-xs text-neutral-400 uppercase font-semibold tracking-widest">
            <label>Amplitude</label>
            <span className="text-white">{amp}%</span>
          </div>
          <input 
            type="range" min="0" max="100" step="1" 
            value={amp} onChange={(e) => setAmp(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}