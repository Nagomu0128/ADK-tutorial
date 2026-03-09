"use client";

import { useState } from "react";
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
        {showResults && <ResearchReport report={mockReport} />}

        {/* Suggestions Table */}
        {showResults && (
          <SuggestionTable suggestions={mockReport.suggestions} />
        )}

        {/* Bottom Grid: Sentiment + Risk | News | Stocks */}
        {showResults && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <SentimentGauge
                marketSentiment={0.42}
                sentiments={mockSentimentResults}
              />
              <RiskScore assessment={mockRiskAssessment} />
            </div>
            <div>
              <NewsFeed news={mockNewsResults} />
            </div>
            <div>
              <StockList stocks={mockStockResults} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
