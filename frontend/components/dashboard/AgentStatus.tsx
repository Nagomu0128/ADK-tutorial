"use client";

import { clsx } from "clsx";
import { CheckCircle2, Loader2, Clock, XCircle, ChevronRight } from "lucide-react";
import type { AgentStatus as AgentStatusType, AgentRunStatus } from "@/lib/types";
import Card from "@/components/ui/Card";

type AgentStatusProps = {
  readonly statuses: readonly AgentStatusType[];
};

const statusConfig: Record<
  AgentRunStatus,
  { icon: React.ReactNode; color: string; bgColor: string; borderColor: string; label: string; glowColor: string }
> = {
  completed: {
    icon: <CheckCircle2 size={15} />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    borderColor: "border-emerald-500/15",
    label: "Done",
    glowColor: "",
  },
  running: {
    icon: <Loader2 size={15} className="animate-spin" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    label: "Running",
    glowColor: "shadow-blue-500/10 shadow-md",
  },
  pending: {
    icon: <Clock size={15} />,
    color: "text-slate-500",
    bgColor: "bg-slate-500/3",
    borderColor: "border-slate-500/10",
    label: "Waiting",
    glowColor: "",
  },
  failed: {
    icon: <XCircle size={15} />,
    color: "text-red-400",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/15",
    label: "Failed",
    glowColor: "",
  },
};

const AgentStatusItem = ({
  agent,
  index,
}: {
  readonly agent: AgentStatusType;
  readonly index: number;
}) => {
  const config = statusConfig[agent.status];
  const delayClass = `delay-${index * 75}`;

  return (
    <div
      className={clsx(
        "animate-fade-in relative flex flex-col items-center gap-2 rounded-xl border px-3 py-3 transition-all duration-500",
        config.bgColor,
        config.borderColor,
        config.glowColor,
        agent.status === "running" && "animate-pulse-glow",
        delayClass
      )}
    >
      {/* Status icon */}
      <div className={clsx("flex items-center justify-center", config.color)}>
        {config.icon}
      </div>
      {/* Agent name */}
      <span className="text-center text-[11px] font-medium text-slate-300 leading-tight">
        {agent.agentName}
      </span>
      {/* Status label */}
      <span className={clsx("text-[10px] font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  );
};

const ConnectorArrow = () => (
  <div className="hidden lg:flex items-center self-center text-slate-700">
    <ChevronRight size={14} />
  </div>
);

const AgentStatusDisplay = ({ statuses }: AgentStatusProps) => (
  <Card title="Agent Pipeline">
    <div className="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap lg:gap-1">
      {statuses.map((agent, i) => (
        <div key={agent.agentName} className="contents">
          <div className="w-[calc(33%-8px)] lg:w-0 lg:flex-1">
            <AgentStatusItem agent={agent} index={i} />
          </div>
          {i < statuses.length - 1 && <ConnectorArrow />}
        </div>
      ))}
    </div>
  </Card>
);

export default AgentStatusDisplay;
