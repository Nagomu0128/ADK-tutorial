import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-blue hover:bg-blue-600 text-white shadow-md shadow-blue-500/20",
  secondary:
    "bg-card-bg hover:bg-hover-bg text-foreground border border-card-border",
  danger:
    "bg-accent-red hover:bg-red-600 text-white shadow-md shadow-red-500/20",
  ghost:
    "bg-transparent hover:bg-hover-bg text-muted hover:text-foreground",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = ({
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

export default Button;
