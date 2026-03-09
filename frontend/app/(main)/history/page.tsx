"use client";

import { CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { mockResearchHistory } from "@/lib/mock-data";
import { format } from "date-fns";
import type { ResearchStatus } from "@/lib/types";

const statusConfig: Record<
  ResearchStatus,
  { icon: React.ReactNode; variant: "green" | "red" | "yellow" | "gray"; label: string; dotColor: string }
> = {
  completed: {
    icon: <CheckCircle2 size={15} />,
    variant: "green",
    label: "Completed",
    dotColor: "bg-emerald-400",
  },
  failed: {
    icon: <XCircle size={15} />,
    variant: "red",
    label: "Failed",
    dotColor: "bg-red-400",
  },
  in_progress: {
    icon: <Clock size={15} />,
    variant: "yellow",
    label: "In Progress",
    dotColor: "bg-amber-400",
  },
  pending: {
    icon: <Clock size={15} />,
    variant: "gray",
    label: "Pending",
    dotColor: "bg-slate-500",
  },
};

const HistoryPage = () => (
  <div className="min-h-screen">
    <Header />
    <div className="p-4 sm:p-6">
      <h1 className="mb-2 text-2xl font-bold text-foreground tracking-tight">
        Analysis History
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        Past research results are stored for 7 days. Click on a date to view
        the full analysis report.
      </p>
      <Card>
        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-card-border via-card-border to-transparent" />

          <div className="space-y-1">
            {mockResearchHistory.map((item, index) => {
              const config = statusConfig[item.status];
              const delayClass = `delay-${Math.min(index * 75, 450)}`;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={clsx(
                    "animate-fade-in group relative flex w-full items-center gap-4 rounded-xl px-3 py-3.5 text-left transition-all duration-200",
                    "hover:bg-white/[0.02]",
                    delayClass
                  )}
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div className={clsx(
                      "h-2.5 w-2.5 rounded-full ring-4 ring-background",
                      config.dotColor
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(item.date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        Triggered at{" "}
                        {format(new Date(item.createdAt), "HH:mm")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={config.variant} dot>
                        {config.label}
                      </Badge>
                      <ChevronRight size={14} className="text-slate-700 transition-all group-hover:text-accent-blue" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default HistoryPage;
