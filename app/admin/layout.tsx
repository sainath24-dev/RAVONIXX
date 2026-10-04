"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Trophy, PlusCircle, Users, UserPlus, 
  ExternalLink, LogOut, Menu, X, ChevronRight, Shield
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#08090C] text-white">{children}</div>;
  }

  const navSections = [
    {
      title: "TOURNAMENTS",
      items: [
        {
          name: "Manage Tournaments",
          href: "/admin/tournaments",
          icon: Trophy,
          exact: pathname === "/admin/tournaments",
        },
        {
          name: "Host New Tournament",
          href: "/admin/tournaments/new",
          icon: PlusCircle,
          exact: pathname === "/admin/tournaments/new",
        },
      ],
    },
    {
      title: "PLAYERS & ROSTER",
      items: [
        {
          name: "Manage Players",
          href: "/admin/players",
          icon: Users,
          exact: pathname === "/admin/players",
        },
        {
          name: "Add New Player",
          href: "/admin/players/new",
          icon: UserPlus,
          exact: pathname === "/admin/players/new",
        },
      ],
    },
  ];

  return (
    <div 
      className="min-h-screen text-white flex flex-col md:flex-row selection:bg-[#FFB800] selection:text-black font-sans"
      style={{
        backgroundImage: `linear-gradient(135deg, #090E1F 0%, #0E162D 50%, #090D1A 100%)`,
      }}
    >
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0B0E1B] border-b border-[#1A233D] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded bg-white/5 border border-white/10 text-white"
            aria-label="Toggle Navigation"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-display font-black text-lg tracking-wider uppercase text-[#FFB800]">
            FREE FIRE ADMIN
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-xs text-red-400 hover:text-red-300 rounded border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Sidebar (Desktop & Mobile Drawer) matching Free Fire In-Game Colors */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0A0F1F] border-r border-[#1A233D] flex flex-col justify-between transition-transform duration-300 shadow-2xl ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#1A233D] flex items-center justify-between bg-[#0B0E1B]">
            <Link
              href="/admin/tournaments"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div 
                className="w-9 h-9 bg-[#FFB800] text-black font-display font-black flex items-center justify-center text-sm shadow-[0_2px_10px_rgba(255,184,0,0.3)]"
                style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
              >
                FF
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg tracking-wider uppercase text-white group-hover:text-[#FFB800] transition-colors leading-none">
                  RAVONIXX
                </span>
                <span className="text-[10px] font-display font-bold tracking-widest text-[#FFB800] uppercase mt-1">
                  ESPORTS ADMIN
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="p-4 space-y-6">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <div className="px-3 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/50">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded text-xs font-display font-bold tracking-wider uppercase transition-all ${
                          isActive
                            ? "bg-[#FFB800] text-black shadow-[0_2px_10px_rgba(255,184,0,0.3)]"
                            : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-[#FFB800]"}`} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-black" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer / Utilities */}
        <div className="p-4 border-t border-[#1A233D] space-y-2 bg-[#080C19]">
          <Link
            href="/tournaments"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-display font-bold text-white/80 hover:text-white rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-all uppercase tracking-wider"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Public Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-display font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded border border-red-500/20 transition-all uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Container */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
