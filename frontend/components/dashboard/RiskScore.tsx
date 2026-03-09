"use client";

import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { RiskAssessment, RiskAlignment } from "@/lib/types";

type RiskScoreProps = {
  readonly assessment: RiskAssessment;
};

const alignmentConfig: Record<
  RiskAlignment,
  { icon: React.ReactNode; label: string; variant: "green" | "yellow" | "red" }
> = {
  aligned: {
    icon: <CheckCircle2 size={13} />,
    label: "Aligned with tolerance",
    variant: "green",
  },
  over_risk: {
    icon: <ShieldAlert size={13} />,
    label: "Exceeds tolerance",
    variant: "red",
  },
  under_risk: {
    icon: <AlertTriangle size={13} />,
    label: "Below tolerance",
    variant: "yellow",
  },
};

const riskColor = (score: number): string => {
  if (score <= 30) return "#10b981";
  if (score <= 60) return "#f59e0b";
  return "#ef4444";
};

const riskTextColor = (score: number): string => {
  if (score <= 30) return "text-emerald-400";
  if (score <= 60) return "text-amber-400";
  return "text-red-400";
};

const RiskScore = ({ assessment }: RiskScoreProps) => {
  const alignment = alignmentConfig[assessment.riskToleranceAlignment];
  const score = assessment.overallRiskScore;
  const color = riskColor(score);

  // Circular progress parameters
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <Card title="Risk Assessment">
      <div className="space-y-5">
        {/* Circular score */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />
              {/* Glow */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth + 4}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                opacity={0.12}
                className="transition-all duration-1000 ease-out"
              />
              {/* Progress */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={clsx("text-2xl font-bold font-mono", riskTextColor(score))}>
                {score}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted">/100</span>
            </div>
          </div>

          {/* Alignment badge */}
          <div className="mt-3">
            <Badge variant={alignment.variant} dot>
              <span className="flex items-center gap-1">
                {alignment.icon}
                {alignment.label}
              </span>
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />

        {/* Sector Concentration */}
        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Sector Exposure
          </p>
          <div className="space-y-2">
            {assessment.sectorConcentration.map((s) => (
              <div key={s.sector} className="flex items-center gap-2.5">
                <span className="w-20 text-xs text-slate-400">{s.sector}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-800/60 overflow-hidden">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all duration-700",
                      s.ratio > 0.5
                        ? "bg-gradient-to-r from-amber-500/60 to-amber-400/40"
                        : "bg-gradient-to-r from-blue-500/50 to-blue-400/30"
                    )}
                    style={{ width: `${s.ratio * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[11px] font-medium text-muted">
                  {Math.round(s.ratio * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {assessment.warnings.length > 0 && (
          <div className="space-y-2">
            {assessment.warnings.map((warning, idx) => (
              <div
                key={`warning-${idx}`}
                className="flex items-start gap-2.5 rounded-xl border border-amber-500/10 bg-amber-500/3 px-3 py-2.5"
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500/70" />
                <span className="text-[11px] leading-relaxed text-amber-200/70">{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskScore;
