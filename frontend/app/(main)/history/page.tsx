"use client";

import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { clsx } from "clsx";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { mockResearchHistory } from "@/lib/mock-data";
import { format } from "date-fns";
import type { ResearchStatus } from "@/lib/types";

const statusConfig: Record<
  ResearchStatus,
  { icon: React.ReactNode; variant: "green" | "red" | "yellow" | "gray"; label: string }
> = {
  completed: {
    icon: <CheckCircle2 size={16} />,
    variant: "green",
    label: "Completed",
  },
  failed: {
    icon: <XCircle size={16} />,
    variant: "red",
    label: "Failed",
  },
  in_progress: {
    icon: <Clock size={16} />,
    variant: "yellow",
    label: "In Progress",
  },
  pending: {
    icon: <Clock size={16} />,
    variant: "gray",
    label: "Pending",
  },
};

const HistoryPage = () => (
  <div className="min-h-screen">
    <Header />
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Analysis History
      </h1>
      <p className="mb-8 text-sm text-muted">
        Past research results are stored for 7 days. Click on a date to view
        the full analysis report.
      </p>
      <Card>
        <div className="space-y-2">
          {mockResearchHistory.map((item) => {
            const config = statusConfig[item.status];
            return (
              <button
                key={item.id}
                type="button"
                className={clsx(
                  "flex w-full items-center justify-between rounded-lg border border-card-border px-4 py-3 text-left transition-colors",
                  "hover:border-accent-blue/30 hover:bg-hover-bg"
                )}
              >
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(item.date), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted">
                      Created at{" "}
                      {format(new Date(item.createdAt), "HH:mm")}
                    </p>
                  </div>
                </div>
                <Badge variant={config.variant}>
                  <span className="flex items-center gap-1">
                    {config.icon}
                    {config.label}
                  </span>
                </Badge>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  </div>
);

export default HistoryPage;
