import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  HeartPulse,
  Sparkles,
  History,
  LineChart,
  ListChecks,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, displayName } from "@/contexts/auth-context";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/health-check", label: "Health Check", icon: HeartPulse },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/recommendations", label: "Recommendations", icon: ListChecks },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const MOBILE_NAV = NAV.slice(0, 5);

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/dashboard" className="px-2">
          <Logo />
        </Link>

        <nav className="mt-8 flex-1 space-y-1" aria-label="Main">
          {NAV.map((item) => (
            <SideLink key={item.to} {...item} active={pathname === item.to} />
          ))}
        </nav>

        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut className="size-4.5" aria-hidden />
          Logout
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="min-w-0">
          <Logo />
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid size-10 shrink-0 place-items-center rounded-2xl border border-border bg-card"
        >
          {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 right-3 left-3 z-40 rounded-3xl border border-border bg-card p-3 shadow-[var(--shadow-lift)] lg:hidden"
          >
            {NAV.map((item) => (
              <SideLink key={item.to} {...item} active={pathname === item.to} onClick={() => setMenuOpen(false)} />
            ))}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground"
            >
              <LogOut className="size-4.5" aria-hidden /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:pb-12">
          {!online && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-warning/35 bg-warning/12 px-4 py-3 text-sm">
              <WifiOff className="size-4 shrink-0" aria-hidden />
              <span>You're offline. Everything still works — changes sync when you reconnect.</span>
            </div>
          )}
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.main>
          <p className="mt-12 hidden text-xs text-muted-foreground lg:block">
            Signed in as {user?.email} · {displayName(user)}'s preventive workspace
          </p>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {MOBILE_NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-label={label}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px]",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("grid size-9 place-items-center rounded-2xl", active && "gradient-warm")}>
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="truncate px-1">{label.split(" ")[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function SideLink({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "gradient-warm text-foreground shadow-[var(--shadow-soft)]"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4.5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}
