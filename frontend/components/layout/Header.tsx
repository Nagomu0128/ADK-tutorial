"use client";

import { useState } from "react";
import { Play, Loader2, Bell, User, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

type HeaderProps = {
  readonly onTriggerResearch?: () => void;
  readonly isResearching?: boolean;
};

const Header = ({ onTriggerResearch, isResearching = false }: HeaderProps) => {
  const [hasNotification] = useState(true);

  return (
    <header className="sticky top-0 z-30 border-b border-card-border bg-background/70 backdrop-blur-xl">
      {/* Gradient accent line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />

      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Dashboard</h1>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-card-border bg-card-bg-solid/50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-[11px] text-muted">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onTriggerResearch && (
            <Button
              onClick={onTriggerResearch}
              disabled={isResearching}
              size="md"
              glow={!isResearching}
            >
              {isResearching ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Analyzing</span>
                  <span className="animate-pulse-glow">...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Run Research
                </>
              )}
            </Button>
          )}

          <button
            type="button"
            className="relative rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-hover-bg hover:text-foreground"
          >
            <Bell size={17} />
            {hasNotification && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 ring-2 ring-background" />
            )}
          </button>

          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 ring-1 ring-blue-500/20 transition-all duration-200 hover:from-blue-500/30 hover:to-purple-500/30 hover:ring-blue-500/30"
          >
            <User size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
