"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { PersonalizedReport, ReportTone } from "@/lib/types";

type ResearchReportProps = {
  readonly report: PersonalizedReport;
};

const toneLabels: Record<ReportTone, { label: string; variant: "blue" | "purple" | "green" }> = {
  beginner_friendly: { label: "Beginner Friendly", variant: "green" },
  technical: { label: "Technical", variant: "blue" },
  concise: { label: "Concise", variant: "purple" },
};

const ResearchReport = ({ report }: ResearchReportProps) => {
  const tone = toneLabels[report.tone];

  return (
    <Card
      title="Personalized Research Report"
      titleRight={<Badge variant={tone.variant}>{tone.label}</Badge>}
    >
      <p className="text-sm leading-relaxed text-slate-300">
        {report.summary}
      </p>
      {report.riskNotes && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs font-medium text-amber-400">Risk Notes</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
            {report.riskNotes}
          </p>
        </div>
      )}
      <p className="mt-4 text-[10px] text-slate-600 italic">
        Disclaimer: This report is AI-generated for informational purposes only
        and does not constitute investment advice. All investment decisions are
        your own responsibility.
      </p>
    </Card>
  );
};

export default ResearchReport;
