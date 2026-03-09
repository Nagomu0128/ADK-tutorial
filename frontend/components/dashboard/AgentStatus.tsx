"use client";

import { clsx } from "clsx";
import { CheckCircle2, Loader2, Clock, XCircle } from "lucide-react";
import type { AgentStatus as AgentStatusType, AgentRunStatus } from "@/lib/types";
import Card from "@/components/ui/Card";

type AgentStatusProps = {
  readonly statuses: readonly AgentStatusType[];
};

const statusConfig: Record<
  AgentRunStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  completed: {
    icon: <CheckCircle2 size={16} />,
    color: "text-emerald-400",
    label: "Done",
  },
  running: {
    icon: <Loader2 size={16} className="animate-spin" />,
    color: "text-blue-400",
    label: "Running",
  },
  pending: {
    icon: <Clock size={16} />,
    color: "text-slate-500",
    label: "Pending",
  },
  failed: {
    icon: <XCircle size={16} />,
    color: "text-red-400",
    label: "Failed",
  },
};

const AgentStatusItem = ({ agent }: { readonly agent: AgentStatusType }) => {
  const config = statusConfig[agent.status];
  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-300",
        agent.status === "completed" && "border-emerald-500/20 bg-emerald-500/5",
        agent.status === "running" && "border-blue-500/20 bg-blue-500/5",
        agent.status === "pending" && "border-slate-500/20 bg-slate-500/5",
        agent.status === "failed" && "border-red-500/20 bg-red-500/5"
      )}
    >
      <span className={config.color}>{config.icon}</span>
      <span className="text-sm font-medium text-foreground">
        {agent.agentName}
      </span>
      <span className={clsx("ml-auto text-xs", config.color)}>
        {config.label}
      </span>
    </div>
  );
};

const AgentStatusDisplay = ({ statuses }: AgentStatusProps) => (
  <Card title="Agent Status">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {statuses.map((agent) => (
        <AgentStatusItem key={agent.agentName} agent={agent} />
      ))}
    </div>
  </Card>
);

export default AgentStatusDisplay;
