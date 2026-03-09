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
    icon: <CheckCircle2 size={14} />,
    label: "Aligned with tolerance",
    variant: "green",
  },
  over_risk: {
    icon: <ShieldAlert size={14} />,
    label: "Exceeds tolerance",
    variant: "red",
  },
  under_risk: {
    icon: <AlertTriangle size={14} />,
    label: "Below tolerance",
    variant: "yellow",
  },
};

const riskColor = (score: number): string => {
  if (score <= 30) return "text-emerald-400";
  if (score <= 60) return "text-amber-400";
  return "text-red-400";
};

const riskBarColor = (score: number): string => {
  if (score <= 30) return "bg-emerald-400";
  if (score <= 60) return "bg-amber-400";
  return "bg-red-400";
};

const RiskScore = ({ assessment }: RiskScoreProps) => {
  const alignment = alignmentConfig[assessment.riskToleranceAlignment];

  return (
    <Card title="Risk Assessment">
      <div className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <span className={clsx("text-4xl font-bold", riskColor(assessment.overallRiskScore))}>
            {assessment.overallRiskScore}
          </span>
          <span className="text-lg text-muted">/100</span>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
            <div
              className={clsx("h-2 rounded-full transition-all duration-700", riskBarColor(assessment.overallRiskScore))}
              style={{ width: `${assessment.overallRiskScore}%` }}
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant={alignment.variant}>
            <span className="flex items-center gap-1">
              {alignment.icon}
              {alignment.label}
            </span>
          </Badge>
        </div>

        {/* Sector Concentration */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Sector Concentration</p>
          <div className="space-y-1.5">
            {assessment.sectorConcentration.map((s) => (
              <div key={s.sector} className="flex items-center gap-2">
                <span className="w-20 text-xs text-slate-400">{s.sector}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                  <div
                    className={clsx(
                      "h-1.5 rounded-full",
                      s.ratio > 0.5 ? "bg-amber-400" : "bg-accent-blue"
                    )}
                    style={{ width: `${s.ratio * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted">
                  {Math.round(s.ratio * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {assessment.warnings.length > 0 && (
          <div className="space-y-1.5">
            {assessment.warnings.map((warning, idx) => (
              <div
                key={`warning-${idx}`}
                className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                <span className="text-xs text-amber-200/80">{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskScore;
