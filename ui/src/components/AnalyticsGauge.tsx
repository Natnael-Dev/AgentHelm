import React, { useMemo, useState, useEffect } from 'react';
import { WireEvent } from '../types/telemetry';

interface AnalyticsGaugeProps {
  events: WireEvent[];
}

function VUBar({ h }: { h: number }) {
  const color = h > 0.84 ? '#E14A36' : h > 0.65 ? '#F0A83A' : '#F05A2A';
  const filled = Math.max(3, Math.round(h * 54));

  return (
    <div className="w-[10px] h-[54px] bg-[#1A1714] shrink-0 relative overflow-hidden">
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-100 ease-out"
        style={{
          height: `${filled}px`,
          backgroundColor: color,
          boxShadow: `0 0 4px ${color}88`,
        }}
      />
      {/* Tick Marks */}
      {[0.33, 0.66, 0.84].map((t) => (
        <div
          key={t}
          className="absolute left-0 right-0 h-[1px] bg-[rgba(58,51,40,0.9)] z-10"
          style={{ bottom: `${Math.round(t * 54)}px` }}
        />
      ))}
    </div>
  );
}

function VUMeter({ bars }: { bars: number[] }) {
  return (
    <div className="flex items-end gap-[2px]">
      {bars.map((h, i) => (
        <VUBar key={i} h={h} />
      ))}
    </div>
  );
}

export const AnalyticsGauge: React.FC<AnalyticsGaugeProps> = ({ events }) => {
  const [vuBars, setVuBars] = useState<number[]>(() =>
    Array.from({ length: 16 }, () => 0.2 + Math.random() * 0.7)
  );

  const metrics = useMemo(() => {
    let tokens = 0;
    let violations = 0;

    for (const ev of events) {
      tokens += Math.max(1, Math.floor((ev.command.length + ev.diff_patch.length + 64) / 4));
      violations += ev.security_assessment?.policy_violations?.length || 0;
    }

    if (tokens === 0) {
      tokens = 14200;
    }

    const costUsd = tokens * (3.0 / 1_000_000);
    const velocity = events.length > 0 ? Math.min(2400, Math.floor((tokens / Math.max(1, events.length)) * 8)) : 320;

    return {
      tokens,
      costUsd,
      violations,
      velocity,
    };
  }, [events]);

  useEffect(() => {
    const id = setInterval(() => {
      setVuBars((prev) =>
        prev.map((v) => Math.max(0.05, Math.min(1, v + (Math.random() - 0.46) * 0.3)))
      );
    }, 120);
    return () => clearInterval(id);
  }, []);

  const formattedCost = `$${metrics.costUsd.toFixed(4)}`;

  return (
    <div className="bg-[#C8BDA8] border border-[#3A3328] shadow-[4px_4px_0_#000] p-4 flex-1 flex flex-col relative overflow-hidden select-none">
      {/* Paper texture lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 paper-texture" />

      {/* Content */}
      <div className="relative flex flex-col h-full z-10">
        <span className="font-mono text-[13px] text-[#11100C] tracking-[0.15em] opacity-60 mb-1 font-bold">
          TOKEN ANALYTICS
        </span>

        <div
          className="font-serif text-[62px] font-bold text-[#11100C] leading-[0.92] mb-1 tracking-tight"
          style={{ fontVariationSettings: "'opsz' 144, 'wght' 800" }}
        >
          {formattedCost}
        </div>

        <span className="font-mono text-[13px] text-[#827869] tracking-[0.12em] mb-3 font-bold">
          EST. COST / STEP
        </span>

        <VUMeter bars={vuBars} />

        <div className="flex-1" />

        <div className="font-mono text-[14px] text-[#11100C] tracking-[0.05em] opacity-75 border-t border-[rgba(17,16,12,0.18)] pt-2 mt-2 font-bold">
          CTX {metrics.tokens.toLocaleString()} TOK • VEL {metrics.velocity} TOK/S
        </div>
      </div>
    </div>
  );
};
