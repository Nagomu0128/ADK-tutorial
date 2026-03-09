"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

type CardProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: string;
  readonly titleRight?: ReactNode;
  readonly accent?: "blue" | "green" | "red" | "purple" | "none";
  readonly noPadding?: boolean;
};

const accentGradients: Record<string, string> = {
  blue: "before:from-blue-500 before:via-blue-400 before:to-cyan-400",
  green: "before:from-emerald-500 before:via-emerald-400 before:to-teal-400",
  red: "before:from-red-500 before:via-red-400 before:to-orange-400",
  purple: "before:from-purple-500 before:via-violet-400 before:to-blue-400",
};

const Card = ({
  children,
  className,
  title,
  titleRight,
  accent = "none",
  noPadding = false,
}: CardProps) => (
  <div
    className={clsx(
      "animate-fade-in relative rounded-2xl border border-card-border bg-card-bg backdrop-blur-xl",
      "transition-all duration-300",
      "hover:border-card-border-hover hover:shadow-lg hover:shadow-black/20",
      accent !== "none" && [
        "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] before:rounded-full before:bg-gradient-to-b",
        accentGradients[accent],
      ],
      noPadding ? "" : "p-5",
      className
    )}
  >
    {title && (
      <div className={clsx("mb-4 flex items-center justify-between", noPadding && "px-5 pt-5")}>
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          <span className="inline-block h-1 w-1 rounded-full bg-accent-blue opacity-60" />
          {title}
        </h3>
        {titleRight}
      </div>
    )}
    {children}
  </div>
);

export default Card;
