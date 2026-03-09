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
import type { PricePoint } from "@/lib/types";
import { format } from "date-fns";

type StockChartProps = {
  readonly symbol: string;
  readonly priceHistory: readonly PricePoint[];
  readonly trend?: "bullish" | "bearish" | "neutral";
};

const trendColors = {
  bullish: { stroke: "#10b981", fill: "#10b981", shadow: "rgba(16, 185, 129, 0.1)" },
  bearish: { stroke: "#ef4444", fill: "#ef4444", shadow: "rgba(239, 68, 68, 0.1)" },
  neutral: { stroke: "#3b82f6", fill: "#3b82f6", shadow: "rgba(59, 130, 246, 0.1)" },
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
    <div className="rounded-xl border border-card-border bg-card-bg-solid/95 px-3.5 py-2.5 shadow-xl shadow-black/30 backdrop-blur-xl">
      <p className="text-[10px] text-slate-500">
        {label ? format(new Date(label), "MMM d, yyyy") : ""}
      </p>
      <p className="mt-0.5 text-sm font-bold text-foreground font-mono">
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
    <Card title={`${symbol} -- 30 Day Price`}>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.fill} stopOpacity={0.15} />
                <stop offset="60%" stopColor={colors.fill} stopOpacity={0.05} />
                <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(30, 41, 59, 0.4)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(val: string) => format(new Date(val), "M/d")}
              stroke="#334155"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis
              stroke="#334155"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(val: number) => `$${val}`}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#gradient-${symbol})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: colors.stroke,
                stroke: "#0f172a",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StockChart;
