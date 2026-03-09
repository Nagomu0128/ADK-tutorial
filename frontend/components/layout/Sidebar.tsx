"use client";

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
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

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

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  const handleSignOut = async () => {
    await logOut();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-card-border bg-sidebar-bg backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-card-border px-5">
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
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
              )}
              <span className={clsx(
                "transition-colors duration-200",
                isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"
              )}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Sign Out */}
      <div className="border-t border-card-border p-3">
        {user && (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-7 w-7 rounded-full ring-1 ring-card-border"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                <User size={13} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-slate-300">
                {user.displayName ?? "User"}
              </p>
              <p className="truncate text-[10px] text-slate-600">
                {user.email}
              </p>
            </div>
          </div>
        )}
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
  );
};

export default Sidebar;
