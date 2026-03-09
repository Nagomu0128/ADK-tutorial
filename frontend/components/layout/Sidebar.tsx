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

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-card-border bg-sidebar-bg">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-card-border px-5">
        <TrendingUp size={24} className="text-accent-blue" />
        <span className="text-lg font-bold tracking-tight">
          AI Stock<span className="text-accent-blue"> Advisor</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "text-muted hover:bg-hover-bg hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-card-border p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-hover-bg hover:text-foreground"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
