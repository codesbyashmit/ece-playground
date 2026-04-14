"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const Wave = ({ type, color, freq, visible }: { type: 'E' | 'B', color: string, freq: number, visible: boolean }) => {
  const lineRef = useRef<THREE.Line>(null);
  const vectorsRef = useRef<THREE.LineSegments>(null);

  const length = 60;
  const pointsCount = 400;

  const lineGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const vectorGeo = useMemo(() => new THREE.BufferGeometry(), []);

  const linePositions = useMemo(() => new Float32Array(pointsCount * 3), []);
  const vectorPositions = useMemo(() => new Float32Array(pointsCount * 6), []);

  useFrame(({ clock }) => {
    if (!visible) return;
    const t = clock.getElapsedTime() * 3;

    for (let i = 0; i < pointsCount; i++) {
      const x = (i / pointsCount) * length - (length / 2);
      const phase = (x * freq * 0.5) - t;
      const amp = Math.sin(phase) * 7;

      const y = type === 'E' ? amp : 0;
      const z = type === 'B' ? amp : 0;
      linePositions[i * 3] = x;
      linePositions[i * 3 + 1] = y;
      linePositions[i * 3 + 2] = z;
      vectorPositions[i * 6] = x;
      vectorPositions[i * 6 + 1] = 0;
      vectorPositions[i * 6 + 2] = 0;
      vectorPositions[i * 6 + 3] = x;
      vectorPositions[i * 6 + 4] = y;
      vectorPositions[i * 6 + 5] = z;
    }

    if (lineRef.current) {
      lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (vectorsRef.current) {
      vectorsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(vectorPositions, 3));
      vectorsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!visible) return null;

  return (
    <group>
      <line ref={lineRef} geometry={lineGeo} frustumCulled={false}>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
      <lineSegments ref={vectorsRef} geometry={vectorGeo} frustumCulled={false}>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
};

export default function EMWave() {
  const [freq, setFreq] = useState(2);
  const [showE, setShowE] = useState(true);
  const [showB, setShowB] = useState(true);

  const c = 299792458;
  const wavelengthNm = ((c / (freq * 1e12)) * 1e9).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col h-full gap-6">

      {/* HEADER & TELEMETRY */}
      <div className="flex justify-between items-end border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Electromagnetic Propagation</h2>
          <p className="text-neutral-500 text-sm">3D Orthogonal Wave Visualizer</p>
        </div>
        <div className="flex flex-col items-end gap-1 font-mono text-xs text-right">
          <div className="text-white mb-1 uppercase tracking-widest text-[10px]">Real-Time Telemetry</div>
          <div className="text-cyan-400">c = 299,792,458 m/s</div>
          <div className="text-magenta-400 font-bold tracking-widest text-[10px]">c = λƒ</div>
          <div className="text-neutral-400">λ: ~{wavelengthNm} nm</div>
        </div>
      </div>
      <div className="relative flex-1 min-h-[450px] border border-neutral-800 bg-[#050505] rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="absolute inset-0">
          <Canvas
            style={{ width: '100%', height: '100%' }}
            camera={{ position: [12, 6, 12], fov: 60 }}
          >
            <color attach="background" args={["#050505"]} />
            <ambientLight intensity={2} />

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              maxPolarAngle={Math.PI / 2 + 0.1}
              minPolarAngle={0.1}
            />

            {/* Main Axis Line */}
            <line frustumCulled={false}>
              <bufferGeometry attach="geometry">
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([-30, 0, 0, 30, 0, 0])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial attach="material" color="#333333" />
            </line>

            <Wave type="E" color="#00f5d4" freq={freq} visible={showE} />
            <Wave type="B" color="#f15bb5" freq={freq} visible={showB} />

            <Text position={[28, 0, 0]} color="#ffffff" fontSize={0.8}>X</Text>
            <Text position={[0, 8, 0]} color="#00f5d4" fontSize={0.7}>E-Field</Text>
            <Text position={[0, 0, 8]} color="#f15bb5" fontSize={0.7}>B-Field</Text>
          </Canvas>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111115] border border-neutral-800 p-6 rounded-sm">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-xs text-neutral-400 uppercase font-semibold tracking-widest">
            <label>Wave Frequency (ƒ)</label>
            <span className="text-white">{freq.toFixed(1)} THz (Simulated)</span>
          </div>
          <input
            type="range" min="0.5" max="5" step="0.1"
            value={freq} onChange={(e) => setFreq(Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-4 justify-center">
          <div className="text-xs text-neutral-400 uppercase font-semibold tracking-widest mb-2">Field Display Toggles</div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowE(!showE)}
              className={`flex-1 py-2 text-xs uppercase border transition-colors ${
                showE
                  ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_10px_rgba(0,245,212,0.2)]"
                  : "border-neutral-700 text-neutral-500"
              }`}
            >
              E-Field (Electric)
            </button>
            <button
              onClick={() => setShowB(!showB)}
              className={`flex-1 py-2 text-xs uppercase border transition-colors ${
                showB
                  ? "border-[#f15bb5] bg-[#f15bb5]/10 text-[#f15bb5] shadow-[0_0_10px_rgba(241,91,181,0.2)]"
                  : "border-neutral-700 text-neutral-500"
              }`}
            >
              B-Field (Magnetic)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}