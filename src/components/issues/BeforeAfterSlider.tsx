'use client';

import { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  heightClass?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Initial Damage (Citizen Report)',
  afterLabel = 'Official Resolution (Repaired)',
  heightClass = 'h-96 sm:h-[450px]',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden shadow-xl border border-slate-200 select-none cursor-ew-resize group bg-slate-900`}
    >
      {/* After Image (Background layer - 100% width) */}
      <img
        src={afterImage}
        alt="After Resolution"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before Image (Foreground layer - clipped by sliderPosition) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Before Resolution"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw',
            maxWidth: 'none',
          }}
          draggable={false}
        />
      </div>

      {/* Dividing Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Drag Handle Bubble */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-2xl border-2 border-indigo-600 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
          <ChevronsLeftRight className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <span className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {beforeLabel}
        </span>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none z-10">
        <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {afterLabel}
        </span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow">
          Drag slider left/right to compare damage vs repair
        </span>
      </div>
    </div>
  );
}
