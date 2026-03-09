import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "green" | "red" | "yellow" | "blue" | "purple" | "gray";

type BadgeProps = {
  readonly variant?: BadgeVariant;
  readonly children: ReactNode;
  readonly className?: string;
  readonly dot?: boolean;
};

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
  red: "bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5",
  yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/5",
  gray: "bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-slate-500/5",
};

const dotColors: Record<BadgeVariant, string> = {
  green: "bg-emerald-400",
  red: "bg-red-400",
  yellow: "bg-amber-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
  gray: "bg-slate-400",
};

const Badge = ({ variant = "gray", children, className, dot = false }: BadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-sm",
      variantStyles[variant],
      className
    )}
  >
    {dot && <span className={clsx("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
    {children}
  </span>
);

export default Badge;
