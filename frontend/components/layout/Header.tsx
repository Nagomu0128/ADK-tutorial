"use client";

import { useState } from "react";
import { Play, Loader2, Bell, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

type HeaderProps = {
  readonly onTriggerResearch?: () => void;
  readonly isResearching?: boolean;
};

const Header = ({ onTriggerResearch, isResearching = false }: HeaderProps) => {
  const [hasNotification] = useState(true);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-card-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <span className="text-xs text-muted">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onTriggerResearch && (
          <Button
            onClick={onTriggerResearch}
            disabled={isResearching}
            size="md"
          >
            {isResearching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Research
              </>
            )}
          </Button>
        )}

        <button
          type="button"
          className="relative rounded-lg p-2 text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
        >
          <Bell size={18} />
          {hasNotification && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-blue" />
          )}
        </button>

        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue transition-colors hover:bg-accent-blue/30"
        >
          <User size={16} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
