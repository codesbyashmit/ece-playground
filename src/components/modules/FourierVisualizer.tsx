"use client";

import { useEffect, useRef, useState } from "react";

type WaveformType = "square" | "sawtooth";

export default function FourierVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [terms, setTerms] = useState<number>(5);
  const [waveType, setWaveType] = useState<WaveformType>("square");
  const [timeScale, setTimeScale] = useState<number>(0.02);

  const paramsRef = useRef({ terms, waveType, timeScale });

  useEffect(() => {
    paramsRef.current = { terms, waveType, timeScale };
  }, [terms, waveType, timeScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const wavePath: number[] = [];
    let lastWidth = 0;
    let lastHeight = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = rect.width;
      const logicalHeight = rect.height;

      if (canvas.width !== Math.round(logicalWidth * dpr) || canvas.height !== Math.round(logicalHeight * dpr)) {
        canvas.width = Math.round(logicalWidth * dpr);
        canvas.height = Math.round(logicalHeight * dpr);
        ctx.scale(dpr, dpr);
        if (lastWidth !== logicalWidth || lastHeight !== logicalHeight) {
          wavePath.length = 0;
          lastWidth = logicalWidth;
          lastHeight = logicalHeight;
        }
      }
      ctx.fillStyle = "rgba(10, 10, 15, 0.3)";
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      const { terms, waveType, timeScale } = paramsRef.current;
      const centerX = logicalWidth * 0.22;
      const centerY = logicalHeight / 2;
      const maxRadiusByHeight = (logicalHeight / 2) * 0.82;
      const maxRadiusByLeft = centerX * 0.90;
      const baseRadius = Math.min(maxRadiusByHeight, maxRadiusByLeft, logicalWidth * 0.14);

      let x = centerX;
      let y = centerY;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, logicalHeight / 2);
      ctx.lineTo(logicalWidth, logicalHeight / 2);
      ctx.stroke();

      for (let i = 0; i < terms; i++) {
        let prevX = x;
        let prevY = y;
        let n = 0;
        let radius = 0;

        if (waveType === "square") {
          n = i * 2 + 1;
          radius = baseRadius * (4 / (n * Math.PI));
        } else if (waveType === "sawtooth") {
          n = i + 1;
          radius = baseRadius * (2 / (n * Math.PI)) * (i % 2 === 0 ? 1 : -1);
        }

        x += radius * Math.cos(n * time);
        y += radius * Math.sin(n * time);
        ctx.beginPath();
        ctx.arc(prevX, prevY, Math.abs(radius), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(0, 245, 212, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#f15bb5";
        ctx.fill();
      }
      const waveStartX = logicalWidth * 0.42;
      const maxWaveLength = logicalWidth - waveStartX - 10; 

      wavePath.unshift(y);
      if (wavePath.length > maxWaveLength) {
        wavePath.length = Math.floor(maxWaveLength);
      }
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(waveStartX, wavePath[0]);
      ctx.strokeStyle = "rgba(241, 91, 181, 0.5)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(waveStartX, wavePath[0]);
      for (let i = 1; i < wavePath.length; i++) {
        ctx.lineTo(waveStartX + i, wavePath[i]);
      }
      ctx.strokeStyle = "#00f5d4";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00f5d4";
      ctx.stroke();
      ctx.shadowBlur = 0;

      time += timeScale;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-screen min-h-0 gap-4 p-4 bg-[#0a0a0f] overflow-hidden">
      <div className="flex justify-between items-end border-b border-neutral-800 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Fourier Transform</h2>
          <p className="text-neutral-500 text-sm">Harmonic Series & Epicycle Synthesis</p>
        </div>

        <div className="flex flex-col items-end gap-1 font-mono text-xs text-right">
          <div className="text-white mb-1 uppercase tracking-widest text-[10px]">Math Engine</div>
          <div className="text-cyan-400">Domain: Time → Freq</div>
          <div className="text-[#f15bb5] font-bold tracking-widest text-[10px]">Σ (A_n * sin(nωt))</div>
        </div>
      </div>
      <div className="w-full flex-1 min-h-0 border border-neutral-800 bg-[#050505] relative rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        <div className="absolute top-4 left-4 flex flex-col gap-1 font-mono text-xs bg-black/60 p-3 border border-neutral-800 backdrop-blur-sm pointer-events-none">
          <div className="text-white border-b border-neutral-800 pb-1 mb-1">HARMONIC DATA</div>
          <div className="text-cyan-400">Target: {waveType.toUpperCase()}</div>
          <div className="text-neutral-400">Active Phasors: {terms}</div>
          <div className="text-neutral-400 mt-2 text-[10px] max-w-[200px]">
            Visualizing how complex signals are built by summing individual pure sine waves.
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#111115] border border-neutral-800 p-6 rounded-sm shrink-0">
        <div className="flex flex-col gap-4 justify-center">
          <div className="text-xs text-neutral-400 uppercase font-semibold tracking-widest mb-2">Target Waveform</div>
          <div className="flex gap-4">
            <button
              onClick={() => setWaveType("square")}
              className={`flex-1 py-2 text-xs uppercase border transition-colors ${
                waveType === "square"
                  ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_10px_rgba(0,245,212,0.2)]"
                  : "border-neutral-700 text-neutral-500"
              }`}
            >
              Square
            </button>
            <button
              onClick={() => setWaveType("sawtooth")}
              className={`flex-1 py-2 text-xs uppercase border transition-colors ${
                waveType === "sawtooth"
                  ? "border-[#f15bb5] bg-[#f15bb5]/10 text-[#f15bb5] shadow-[0_0_10px_rgba(241,91,181,0.2)]"
                  : "border-neutral-700 text-neutral-500"
              }`}
            >
              Sawtooth
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-xs text-neutral-400 uppercase font-semibold tracking-widest">
            <label>Harmonics (n)</label>
            <span className="text-white">{terms}</span>
          </div>
          <input
            type="range" min="1" max="50" step="1"
            value={terms} onChange={(e) => setTerms(Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
          <span className="text-[10px] text-neutral-500 text-right">More harmonics = sharper approximation</span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-xs text-neutral-400 uppercase font-semibold tracking-widest">
            <label>Time Scale (ω)</label>
            <span className="text-white">{timeScale.toFixed(3)}</span>
          </div>
          <input
            type="range" min="0.005" max="0.1" step="0.005"
            value={timeScale} onChange={(e) => setTimeScale(Number(e.target.value))}
            className="w-full accent-[#f15bb5] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}