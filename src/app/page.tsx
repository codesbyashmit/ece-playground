"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Waves, Cpu, Zap, Scan } from "lucide-react";
import Oscilloscope from "../components/modules/Oscilloscope";
// import FourierVisualizer from "@/components/modules/FourierVisualizer";
// import LogicGates from "@/components/modules/LogicGates";
import EMWave from "@/components/modules/EMWave";
// import ComponentScanner from "@/components/modules/ComponentScanner";

const MODULES = [
  { id: "scope", name: "Oscilloscope", icon: Activity, component: Oscilloscope },
  { id: "fourier", name: "Fourier Transform", icon: Waves, component: () => <div>Fourier Placeholder</div> },
  { id: "logic", name: "Logic Gates", icon: Cpu, component: () => <div>Logic Gates Placeholder</div> },
  { id: "em", name: "EM Propagation", icon: Zap, component: EMWave },
  { id: "ai", name: "AI Scanner", icon: Scan, component: () => <div>AI Scanner Placeholder</div> },
];

export default function ECELab() {
  const [activeModule, setActiveModule] = useState(MODULES[0].id);

  const CurrentModule = MODULES.find((m) => m.id === activeModule)?.component || MODULES[0].component;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-mono flex flex-col selection:bg-cyan-500/30">
      <header className="border-b border-neutral-800 bg-[#0a0a0f] p-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <Zap className="text-cyan-400 h-6 w-6" />
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white uppercase">ECE_Playground</h1>
            <p className="text-xs text-neutral-500 hidden sm:block">Visualise. Simulate. Understand.</p>
          </div>
        </div>

        <nav className="flex gap-2 bg-neutral-900/50 p-1 rounded-sm border border-neutral-800">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-all rounded-sm ${
                  isActive 
                    ? "bg-neutral-100 text-black font-semibold shadow-[4px_4px_0px_0px_rgba(0,245,212,0.3)]" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{mod.name}</span>
              </button>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full"
          >
            <CurrentModule />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}