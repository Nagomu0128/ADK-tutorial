"use client";

import { useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import Header from "@/components/layout/Header";
import AgentStatusDisplay from "@/components/dashboard/AgentStatus";
import ResearchReport from "@/components/dashboard/ResearchReport";
import SuggestionTable from "@/components/dashboard/SuggestionTable";
import SentimentGauge from "@/components/dashboard/SentimentGauge";
import RiskScore from "@/components/dashboard/RiskScore";
import NewsFeed from "@/components/dashboard/NewsFeed";
import StockList from "@/components/dashboard/StockList";
import {
  mockAgentStatuses,
  mockAgentStatusesCompleted,
  mockReport,
  mockSentimentResults,
  mockRiskAssessment,
  mockNewsResults,
  mockStockResults,
} from "@/lib/mock-data";
import type { AgentStatus } from "@/lib/types";

const SectionHeading = ({
  icon,
  title,
}: {
  readonly icon: React.ReactNode;
  readonly title: string;
}) => (
  <div className="flex items-center gap-2.5 pt-2 pb-1">
    <span className="text-slate-600">{icon}</span>
    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-card-border to-transparent" />
  </div>
);

const DashboardPage = () => {
  const [isResearching, setIsResearching] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [agentStatuses, setAgentStatuses] = useState<readonly AgentStatus[]>(
    mockAgentStatusesCompleted
  );

  const handleTriggerResearch = () => {
    setIsResearching(true);
    setAgentStatuses(mockAgentStatuses);
    setShowResults(false);

    // Simulate research completion
    setTimeout(() => {
      setAgentStatuses(mockAgentStatusesCompleted);
      setIsResearching(false);
      setShowResults(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      <Header
        onTriggerResearch={handleTriggerResearch}
        isResearching={isResearching}
      />

      <div className="space-y-6 p-6">
        {/* Agent Status */}
        {(isResearching || showResults) && (
          <AgentStatusDisplay statuses={agentStatuses} />
        )}

        {/* Research Report */}
        {showResults && (
          <div className="animate-slide-up">
            <ResearchReport report={mockReport} />
          </div>
        )}

        {/* Suggestions Table */}
        {showResults && (
          <div className="animate-slide-up delay-150">
            <SuggestionTable suggestions={mockReport.suggestions} />
          </div>
        )}

        {/* Market Intelligence Section */}
        {showResults && (
          <>
            <SectionHeading
              icon={<Activity size={14} />}
              title="Market Intelligence"
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Sentiment + Risk: narrower column */}
              <div className="space-y-6 lg:col-span-3">
                <SentimentGauge
                  marketSentiment={0.42}
                  sentiments={mockSentimentResults}
                />
                <RiskScore assessment={mockRiskAssessment} />
              </div>
              {/* News: wider column */}
              <div className="lg:col-span-5">
                <NewsFeed news={mockNewsResults} />
              </div>
              {/* Stocks */}
              <div className="lg:col-span-4">
                <div className="flex items-center gap-2 mb-0">
                  {/* Intentionally empty - just spacing alignment */}
                </div>
                <StockList stocks={mockStockResults} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
