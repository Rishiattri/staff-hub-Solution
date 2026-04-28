"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";  
import { useDispatch } from "react-redux";

import { getStoredAuth } from "@/src/services/api/client";
import { logout } from "@/src/store/auth/authSlice";

const logoutItem = { label: "Logout", href: "/login", icon: "logout" };

function Icon({ type }: { type: string }) {
  const common = "h-4 w-4";

  switch (type) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M3 13h8V3H3zm10 8h8v-8h-8zM3 21h8v-6H3zm10-10h8V3h-8z" />
        </svg>
      );
    case "employee":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M16 11h6" />
        </svg>
      );
    case "project":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M3 7.5 12 3l9 4.5-9 4.5z" />
          <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case "leave":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <path d="M8 2v4M16 2v4M3 10h18" />
          <path d="M8 14h4" />
        </svg>
      );
    case "salary":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <rect x="2.5" y="5" width="19" height="14" rx="3" />
          <path d="M2.5 10h19" />
          <circle cx="12" cy="14" r="2.5" />
        </svg>
      );
    case "attendance":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "celebration":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M12 21s-6-3.6-6-9a3 3 0 0 1 5.1-2.1L12 11l.9-1.1A3 3 0 0 1 18 12c0 5.4-6 9-6 9Z" />
          <path d="M8 4h.01M16 5h.01M6 8h.01" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M6 12h12M12 6v12" />
        </svg>
      );
  }
}

function BrandBlock() {
  return (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_10px_30px_rgba(124,58,237,0.45)]">
        <svg width="20" height="20" viewBox="0 0 18 18" fill="#fff">
          <path d="M3 3h5v5H3V3zm7 0h5v5h-5V3zm-7 7h5v5H3v-5zm7 2h2v2h-2v-2zm3-2h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2z" />
        </svg>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-white">Staff<span className="text-violet-300">Hub</span></div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Office management suite</p>
      </div>
    </>
  );
}

export function OfficeShell({
  title,
  subtitle,
  children,
  actions
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = getStoredAuth();
  const isAdmin = auth?.user?.role === "admin";
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    ...(isAdmin ? [{ label: "Employees", href: "/employees", icon: "employee" }] : []),
    { label: "Projects", href: "/projects", icon: "project" },
    { label: "Leaves", href: "/leaves", icon: "leave" },
    { label: "Salaries", href: "/salaries", icon: "salary" },
    { label: "Attendance", href: "/attendance", icon: "attendance" },
    { label: "Holidays & Birthdays", href: "/celebrations", icon: "celebration" }
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("staffhub_auth");
    }

    dispatch(logout());
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const renderNav = (mobile = false) => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={`${mobile ? "mobile" : "desktop"}-${item.href}`}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
              active
                ? "border-violet-400/30 bg-white/8 text-white shadow-[0_10px_25px_rgba(124,58,237,0.18)]"
                : "border-transparent bg-white/[0.02] text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-violet-500/20 text-violet-200" : "bg-slate-900/80 text-slate-400 group-hover:text-violet-200"}`}>
              <Icon type={item.icon} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderLogout = (mobile = false) => (
    <button
      type="button"
      onClick={handleLogout}
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
        mobile
          ? "border-rose-400/15 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
          : "border-rose-400/15 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-200">
        <Icon type={logoutItem.icon} />
      </span>
      <span>{logoutItem.label}</span>
    </button>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-white">
      <div
        className={`fixed inset-0 z-40 bg-slate-950/72 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] max-w-[84vw] flex-col overflow-hidden border-r border-white/10 bg-slate-950/95 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur transition-transform duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-b border-white/8 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandBlock />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-violet-300/80">Workspace</p>
          {renderNav(true)}
        </div>
        <div className="border-t border-white/8 px-4 py-4">
          {renderLogout(true)}
        </div>
      </aside>

      <div className="mx-auto flex min-h-[calc(100vh-0.25rem)] w-full max-w-[1600px] items-stretch gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:gap-6 lg:px-6">
        <aside className="hidden min-h-full w-[280px] shrink-0 self-stretch flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:flex">
          <div className="border-b border-white/8 px-6 py-6">
            <div className="flex items-center gap-3">
              <BrandBlock />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-violet-300/80">Workspace</p>
            {renderNav(false)}
          </div>
          <div className="border-t border-white/8 px-4 py-4">
            {renderLogout(false)}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <header className="rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur sm:px-5 sm:py-5 lg:rounded-[28px] lg:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_10px_30px_rgba(124,58,237,0.35)]">
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="#fff">
                        <path d="M3 3h5v5H3V3zm7 0h5v5h-5V3zm-7 7h5v5H3v-5zm7 2h2v2h-2v-2zm3-2h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-white">StaffHub</span>
                  </div>
                </div>

                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300/80">StaffHub workspace</p>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 md:text-[15px]">{subtitle}</p>
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-3 max-sm:w-full max-sm:*:flex-1 max-sm:*:justify-center">{actions}</div> : null}
            </div>
          </header>

          <main className="space-y-4 sm:space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function SurfaceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/65 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:rounded-[26px] sm:p-6 ${className}`}>{children}</section>;
}
