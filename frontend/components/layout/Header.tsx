"use client";

import { useState } from "react";
import { Play, Loader2, Bell, User, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

type HeaderProps = {
  readonly onTriggerResearch?: () => void;
  readonly isResearching?: boolean;
};

const Header = ({ onTriggerResearch, isResearching = false }: HeaderProps) => {
  const [hasNotification] = useState(true);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-card-border bg-background/70 backdrop-blur-xl">
      {/* Gradient accent line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />

      <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <h1 className="text-base font-semibold text-foreground tracking-tight sm:text-lg">Dashboard</h1>
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          {onTriggerResearch && (
            <Button
              onClick={onTriggerResearch}
              disabled={isResearching}
              size="md"
              glow={!isResearching}
              className="!px-3 !text-xs sm:!px-4 sm:!text-sm"
            >
              {isResearching ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span className="hidden sm:inline">Analyzing</span>
                  <span className="animate-pulse-glow">...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span className="hidden sm:inline">Run Research</span>
                  <span className="sm:hidden">Run</span>
                </>
              )}
            </Button>
          )}

          <button
            type="button"
            className="relative rounded-xl p-2 text-slate-500 transition-all duration-200 hover:bg-hover-bg hover:text-foreground sm:p-2.5"
          >
            <Bell size={17} />
            {hasNotification && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 ring-2 ring-background sm:right-2 sm:top-2" />
            )}
          </button>

          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 ring-1 ring-blue-500/20 transition-all duration-200 hover:from-blue-500/30 hover:to-purple-500/30 hover:ring-blue-500/30 sm:h-9 sm:w-9"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <User size={15} />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
