import { clsx } from "clsx";
import type { ReactNode } from "react";

type CardProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: string;
  readonly titleRight?: ReactNode;
};

const Card = ({ children, className, title, titleRight }: CardProps) => (
  <div
    className={clsx(
      "rounded-xl border border-card-border bg-card-bg p-5",
      className
    )}
  >
    {title && (
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {title}
        </h3>
        {titleRight}
      </div>
    )}
    {children}
  </div>
);

export default Card;
