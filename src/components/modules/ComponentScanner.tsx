"use client";

import { useState, useRef } from "react";
import { UploadCloud, ScanLine, AlertCircle } from "lucide-react";

export default function ComponentScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      scanComponent(base64);
    };
    reader.readAsDataURL(file);
  };

  const scanComponent = async (base64Image: string) => {
    setIsScanning(true);
    
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to scan");

      // Simple typewriter effect simulation
      simulateTypewriter(data.result);
    } catch (err: any) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  const simulateTypewriter = (text: string) => {
    let i = 0;
    setResult("");
    setIsScanning(false);
    
    const interval = setInterval(() => {
      setResult((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15); // Adjust typing speed here
  };

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">AI Component Scanner</h2>
          <p className="text-neutral-500 text-sm">Optical Hardware Recognition & Analysis</p>
        </div>
        <div className="flex flex-col items-end gap-1 font-mono text-xs text-right">
          <div className="text-white mb-1 uppercase tracking-widest text-[10px]">Neural Engine</div>
          <div className="text-cyan-400">Model: Gemini 1.5 Flash</div>
          <div className="text-neutral-400">Status: {isScanning ? "PROCESSING" : "ONLINE"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[450px]">
        
        {/* LEFT COLUMN: UPLOAD / CAMERA ZONE */}
        <div 
          className="border border-neutral-800 bg-[#050505] rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          
          {imagePreview ? (
            <div className="relative w-full h-full min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Component preview" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
              
              {/* Overlay Scanlines */}
              {isScanning && (
                <div className="absolute inset-0 bg-cyan-400/20 mix-blend-overlay">
                  <div className="w-full h-2 bg-cyan-400/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center text-neutral-500 group-hover:text-cyan-400 transition-colors">
              <UploadCloud className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-mono text-sm uppercase tracking-widest text-white mb-2">Initialize Visual Scan</p>
              <p className="text-xs">Drag & Drop an image or click to browse.</p>
              <p className="text-[10px] mt-4 opacity-50">SUPPORTS: Resistors, ICs, Microcontrollers, Sensors</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TERMINAL READOUT */}
        <div className="border border-neutral-800 bg-[#0a0a0f] rounded-sm p-6 font-mono relative overflow-hidden">
          
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 mb-4 text-xs tracking-widest text-neutral-500 uppercase">
            <ScanLine className="w-4 h-4" />
            <span>Analysis Readout</span>
          </div>

          {error && (
            <div className="text-red-400 text-sm flex gap-2 items-start bg-red-400/10 p-3 rounded-sm border border-red-400/20">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isScanning ? (
            <div className="flex items-center gap-3 text-cyan-400 text-sm">
              <span className="animate-pulse">▶</span>
              <span className="uppercase tracking-widest animate-pulse">Running Neural Inference...</span>
            </div>
          ) : result ? (
            <div className="text-cyan-50 text-sm whitespace-pre-wrap leading-relaxed">
              <span className="text-cyan-400 mr-2">▶</span>
              {result}
              <span className="animate-[ping_1s_step-end_infinite] ml-1">_</span>
            </div>
          ) : !error && (
            <div className="text-neutral-600 text-sm uppercase">
              <span className="mr-2">▶</span>
              Awaiting image input...
            </div>
          )}
        </div>
      </div>

    </div>
  );
}