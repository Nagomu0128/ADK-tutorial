"use client";

import { clsx } from "clsx";

type GaugeProps = {
  readonly value: number; // -1.0 to 1.0
  readonly label?: string;
  readonly size?: "sm" | "md" | "lg";
};

const getGaugeColor = (value: number): string => {
  if (value >= 0.5) return "#10b981";
  if (value >= 0.2) return "#34d399";
  if (value >= -0.2) return "#f59e0b";
  if (value >= -0.5) return "#f87171";
  return "#ef4444";
};

const getLabel = (value: number): string => {
  if (value >= 0.5) return "Very Bullish";
  if (value >= 0.2) return "Bullish";
  if (value >= -0.2) return "Neutral";
  if (value >= -0.5) return "Bearish";
  return "Very Bearish";
};

const sizeMap = {
  sm: { width: 120, height: 70, strokeWidth: 8, fontSize: 14, labelSize: 10 },
  md: { width: 180, height: 100, strokeWidth: 10, fontSize: 20, labelSize: 12 },
  lg: { width: 240, height: 130, strokeWidth: 12, fontSize: 26, labelSize: 14 },
};

const Gauge = ({ value, label, size = "md" }: GaugeProps) => {
  const config = sizeMap[size];
  const normalizedValue = Math.max(-1, Math.min(1, value));
  const percentage = (normalizedValue + 1) / 2; // 0 to 1
  const color = getGaugeColor(normalizedValue);
  const displayLabel = label ?? getLabel(normalizedValue);

  const cx = config.width / 2;
  const cy = config.height - 10;
  const radius = cx - config.strokeWidth - 5;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - percentage);

  return (
    <div className="flex flex-col items-center">
      <svg width={config.width} height={config.height} viewBox={`0 0 ${config.width} ${config.height}`}>
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth + 5} ${cy} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth - 5} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${config.strokeWidth + 5} ${cy} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth - 5} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill={color}
          fontSize={config.fontSize}
          fontWeight="bold"
        >
          {Math.round(normalizedValue * 100)}
        </text>
      </svg>
      <span
        className={clsx("font-medium", {
          "text-xs": size === "sm",
          "text-sm": size === "md",
          "text-base": size === "lg",
        })}
        style={{ color }}
      >
        {displayLabel}
      </span>
    </div>
  );
};

export default Gauge;
