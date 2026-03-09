import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
  readonly glow?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
    "shadow-lg shadow-blue-500/20",
    "hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30",
    "active:from-blue-700 active:to-blue-600 active:scale-[0.98]",
  ].join(" "),
  secondary: [
    "bg-card-bg-solid/80 text-foreground border border-card-border backdrop-blur-sm",
    "hover:bg-hover-bg hover:border-card-border-hover",
    "active:scale-[0.98]",
  ].join(" "),
  danger: [
    "bg-gradient-to-r from-red-600 to-red-500 text-white",
    "shadow-lg shadow-red-500/20",
    "hover:from-red-500 hover:to-red-400 hover:shadow-red-500/30",
    "active:from-red-700 active:to-red-600 active:scale-[0.98]",
  ].join(" "),
  ghost: [
    "bg-transparent text-muted",
    "hover:bg-hover-bg hover:text-foreground",
    "active:scale-[0.98]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

const Button = ({
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  glow = false,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center gap-2 font-medium cursor-pointer",
      "transition-all duration-200 ease-out",
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
      variantStyles[variant],
      sizeStyles[size],
      glow && variant === "primary" && "shadow-xl shadow-blue-500/30",
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

export default Button;
