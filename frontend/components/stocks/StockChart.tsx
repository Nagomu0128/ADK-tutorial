"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Card from "@/components/ui/Card";
import type { PriceHistoryPoint } from "@/lib/types";
import { format } from "date-fns";

type StockChartProps = {
  readonly symbol: string;
  readonly priceHistory: readonly PriceHistoryPoint[];
  readonly trend?: "bullish" | "bearish" | "neutral";
};

const trendColors = {
  bullish: { stroke: "#10b981", fill: "#10b981" },
  bearish: { stroke: "#ef4444", fill: "#ef4444" },
  neutral: { stroke: "#3b82f6", fill: "#3b82f6" },
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  readonly active?: boolean;
  readonly payload?: readonly { readonly value: number }[];
  readonly label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-card-border bg-sidebar-bg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted">
        {label ? format(new Date(label), "MMM d, yyyy") : ""}
      </p>
      <p className="text-sm font-semibold text-foreground">
        ${payload[0].value.toFixed(2)}
      </p>
    </div>
  );
};

const StockChart = ({
  symbol,
  priceHistory,
  trend = "neutral",
}: StockChartProps) => {
  const colors = trendColors[trend];
  const data = priceHistory.map((point) => ({
    date: point.date,
    close: point.close,
  }));

  return (
    <Card title={`${symbol} — 30 Day Price Chart`}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.fill} stopOpacity={0.2} />
                <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tickFormatter={(val: string) => format(new Date(val), "M/d")}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(val: number) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StockChart;
