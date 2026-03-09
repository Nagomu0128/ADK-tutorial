"use client";

import { clsx } from "clsx";

type GaugeProps = {
  readonly value: number; // -1.0 to 1.0
  readonly label?: string;
  readonly size?: "sm" | "md" | "lg";
};

const getGaugeColors = (value: number): { start: string; end: string; text: string } => {
  if (value >= 0.5) return { start: "#10b981", end: "#34d399", text: "#10b981" };
  if (value >= 0.2) return { start: "#34d399", end: "#6ee7b7", text: "#34d399" };
  if (value >= -0.2) return { start: "#f59e0b", end: "#fbbf24", text: "#f59e0b" };
  if (value >= -0.5) return { start: "#f87171", end: "#fca5a5", text: "#f87171" };
  return { start: "#ef4444", end: "#f87171", text: "#ef4444" };
};

const getLabel = (value: number): string => {
  if (value >= 0.5) return "Very Bullish";
  if (value >= 0.2) return "Bullish";
  if (value >= -0.2) return "Neutral";
  if (value >= -0.5) return "Bearish";
  return "Very Bearish";
};

const sizeMap = {
  sm: { width: 120, height: 75, strokeWidth: 8, fontSize: 16, labelSize: 10 },
  md: { width: 180, height: 105, strokeWidth: 10, fontSize: 22, labelSize: 12 },
  lg: { width: 240, height: 140, strokeWidth: 12, fontSize: 28, labelSize: 14 },
};

const Gauge = ({ value, label, size = "md" }: GaugeProps) => {
  const config = sizeMap[size];
  const normalizedValue = Math.max(-1, Math.min(1, value));
  const percentage = (normalizedValue + 1) / 2;
  const colors = getGaugeColors(normalizedValue);
  const displayLabel = label ?? getLabel(normalizedValue);

  const cx = config.width / 2;
  const cy = config.height - 15;
  const radius = cx - config.strokeWidth - 8;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - percentage);
  const gradientId = `gauge-gradient-${size}-${Math.round(value * 100)}`;
  const glowId = `gauge-glow-${size}-${Math.round(value * 100)}`;

  // Tick marks positions (5 ticks across the arc)
  const tickCount = 9;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = Math.PI + (Math.PI * i) / (tickCount - 1);
    const innerR = radius - config.strokeWidth / 2 - 4;
    const outerR = radius - config.strokeWidth / 2 - 8;
    return {
      x1: cx + Math.cos(angle) * innerR,
      y1: cy + Math.sin(angle) * innerR,
      x2: cx + Math.cos(angle) * outerR,
      y2: cy + Math.sin(angle) * outerR,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={config.width} height={config.height} viewBox={`0 0 ${config.width} ${config.height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} stopOpacity={0.7} />
            <stop offset="100%" stopColor={colors.end} stopOpacity={1} />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={`tick-${i}`}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#334155"
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}

        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth + 8} ${cy} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth - 8} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />

        {/* Glow arc (behind main) */}
        <path
          d={`M ${config.strokeWidth + 8} ${cy} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth - 8} ${cy}`}
          fill="none"
          stroke={colors.start}
          strokeWidth={config.strokeWidth + 6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          opacity={0.15}
          className="transition-all duration-1000 ease-out"
        />

        {/* Value arc */}
        <path
          d={`M ${config.strokeWidth + 8} ${cy} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth - 8} ${cy}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter={`url(#${glowId})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fill={colors.text}
          fontSize={config.fontSize}
          fontWeight="bold"
          fontFamily="var(--font-geist-mono), monospace"
        >
          {Math.round(normalizedValue * 100)}
        </text>
      </svg>
      <span
        className={clsx("font-semibold tracking-wide", {
          "text-[10px]": size === "sm",
          "text-xs": size === "md",
          "text-sm": size === "lg",
        })}
        style={{ color: colors.text }}
      >
        {displayLabel}
      </span>
    </div>
  );
};

export default Gauge;
