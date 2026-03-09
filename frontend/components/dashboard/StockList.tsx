"use client";

import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import type { StockResult, Trend } from "@/lib/types";

type StockListProps = {
  readonly stocks: readonly StockResult[];
};

const trendConfig: Record<Trend, { icon: React.ReactNode; color: string; bgGlow: string }> = {
  bullish: {
    icon: <TrendingUp size={13} />,
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/5 to-transparent",
  },
  bearish: {
    icon: <TrendingDown size={13} />,
    color: "text-red-400",
    bgGlow: "from-red-500/5 to-transparent",
  },
  neutral: {
    icon: <Minus size={13} />,
    color: "text-amber-400",
    bgGlow: "from-amber-500/3 to-transparent",
  },
};

const formatPrice = (price: number, symbol: string): string => {
  const isJP = symbol.endsWith(".T");
  return isJP
    ? `\u00a5${price.toLocaleString()}`
    : `$${price.toFixed(2)}`;
};

const MiniTrendBar = ({ priceHistory }: { readonly priceHistory: readonly { date: string; close: number }[] }) => {
  const recent = priceHistory.slice(-8);
  if (recent.length === 0) return null;
  const min = Math.min(...recent.map((p) => p.close));
  const max = Math.max(...recent.map((p) => p.close));
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px] h-4">
      {recent.map((point, i) => {
        const height = ((point.close - min) / range) * 100;
        const isLast = i === recent.length - 1;
        const isUp = i > 0 && point.close >= recent[i - 1].close;
        return (
          <div
            key={`bar-${i}`}
            className={clsx(
              "w-[3px] rounded-full transition-all duration-300",
              isLast ? "opacity-100" : "opacity-50",
              isUp ? "bg-emerald-400/60" : "bg-red-400/60"
            )}
            style={{ height: `${Math.max(height, 15)}%` }}
          />
        );
      })}
    </div>
  );
};

const StockItem = ({ stock, index }: { readonly stock: StockResult; readonly index: number }) => {
  const trend = trendConfig[stock.trend];
  const isPositive = stock.changePercent >= 0;
  const delayClass = `delay-${Math.min(index * 75, 450)}`;

  return (
    <Link
      href={`/stocks/${encodeURIComponent(stock.symbol)}`}
      className={clsx(
        "animate-fade-in group relative flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-200",
        "hover:bg-white/[0.02]",
        delayClass
      )}
    >
      {/* Subtle background glow on hover */}
      <div className={clsx(
        "pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100",
        trend.bgGlow
      )} />

      <div className="relative flex items-center gap-3">
        {/* Trend icon */}
        <div className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          isPositive ? "bg-emerald-500/8 text-emerald-400" : "bg-red-500/8 text-red-400"
        )}>
          {trend.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-wide text-foreground">
              {stock.symbol}
            </span>
            <ChevronRight size={12} className="text-slate-700 opacity-0 transition-all group-hover:opacity-100 group-hover:text-accent-blue" />
          </div>
          <span className="text-[10px] text-slate-600">
            RSI {stock.rsi14.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        {/* Mini trend bar */}
        <MiniTrendBar priceHistory={stock.priceHistory} />

        <div className="text-right">
          <span className="text-sm font-semibold text-foreground font-mono">
            {formatPrice(stock.closingPrice, stock.symbol)}
          </span>
          <p
            className={clsx(
              "font-mono text-[11px] font-semibold",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {isPositive ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </Link>
  );
};

const StockList = ({ stocks }: StockListProps) => (
  <Card title="Watchlist">
    <div className="space-y-0.5">
      {stocks.map((stock, i) => (
        <StockItem key={stock.id} stock={stock} index={i} />
      ))}
    </div>
  </Card>
);

export default StockList;
