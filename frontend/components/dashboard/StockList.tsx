"use client";

import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { StockResult, Trend } from "@/lib/types";

type StockListProps = {
  readonly stocks: readonly StockResult[];
};

const trendConfig: Record<Trend, { icon: React.ReactNode; color: string }> = {
  bullish: { icon: <TrendingUp size={14} />, color: "text-emerald-400" },
  bearish: { icon: <TrendingDown size={14} />, color: "text-red-400" },
  neutral: { icon: <Minus size={14} />, color: "text-amber-400" },
};

const formatPrice = (price: number, symbol: string): string => {
  const isJP = symbol.endsWith(".T");
  return isJP
    ? `¥${price.toLocaleString()}`
    : `$${price.toFixed(2)}`;
};

const StockItem = ({ stock }: { readonly stock: StockResult }) => {
  const trend = trendConfig[stock.trend];
  const isPositive = stock.changePercent >= 0;

  return (
    <Link
      href={`/stocks/${encodeURIComponent(stock.symbol)}`}
      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-hover-bg"
    >
      <div className="flex items-center gap-3">
        <span className={trend.color}>{trend.icon}</span>
        <div>
          <span className="font-mono text-sm font-semibold text-foreground">
            {stock.symbol}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant={stock.trend === "bullish" ? "green" : stock.trend === "bearish" ? "red" : "yellow"}>
              {stock.trend}
            </Badge>
            <span className="text-[10px] text-muted">
              RSI {stock.rsi14.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold text-foreground">
          {formatPrice(stock.closingPrice, stock.symbol)}
        </span>
        <p
          className={clsx(
            "text-xs font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {isPositive ? "+" : ""}
          {stock.changePercent.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
};

const StockList = ({ stocks }: StockListProps) => (
  <Card title="Watchlist Prices">
    <div className="space-y-1">
      {stocks.map((stock) => (
        <StockItem key={stock.id} stock={stock} />
      ))}
    </div>
  </Card>
);

export default StockList;
