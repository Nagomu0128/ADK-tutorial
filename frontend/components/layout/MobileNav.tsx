"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  List,
  Clock,
  User,
  TrendingUp,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

type MobileNavProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ReactNode;
};

const navItems: readonly NavItem[] = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/watchlist", label: "Watchlist", icon: <List size={18} /> },
  { href: "/history", label: "History", icon: <Clock size={18} /> },
  { href: "/profile", label: "Profile", icon: <User size={18} /> },
];

const MobileNav = ({ open, onClose }: MobileNavProps) => {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSignOut = async () => {
    await logOut();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-card-border bg-sidebar-bg backdrop-blur-xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-card-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">
                AI Stock
              </span>
              <span className="text-[10px] font-medium tracking-widest text-accent-blue uppercase">
                Advisor
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-hover-bg hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="border-b border-card-border px-5 py-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-9 w-9 rounded-full ring-2 ring-card-border"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 ring-1 ring-blue-500/20">
                  <User size={15} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.displayName ?? "User"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent-blue/8 text-blue-400 shadow-sm shadow-blue-500/5"
                    : "text-slate-500 hover:bg-hover-bg hover:text-slate-300"
                )}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                )}
                <span
                  className={clsx(
                    "transition-colors duration-200",
                    isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-card-border p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-hover-bg hover:text-red-400"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileNav;
