"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  GraduationCap,
} from "lucide-react";

// NOTE: uses arbitrary Tailwind values matching your brand colors
// (#0A66FF primary, #111827 secondary, #FACC15 accent). If you already have
// these registered as theme tokens (e.g. brand-primary) in tailwind.config,
// swap the bracket values below for those token classes.

export const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/lessons", label: "Lessons", icon: PlayCircle },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-[#111827] text-white">
      <div className="flex items-center gap-2.5 px-6 h-[76px] border-b border-white/10">
        <span className="flex items-center justify-center w-9 h-9 rounded-[11px] bg-gradient-to-br from-[#0A66FF] to-[#FACC15] font-bold text-[1.05rem]">
          T
        </span>
        <div className="leading-tight">
          <p className="font-semibold text-[0.95rem]">Tech Enable Solution</p>
          <p className="text-[0.7rem] text-white/50 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.9rem] font-medium transition-colors",
                active
                  ? "bg-[#0A66FF] text-white shadow-[0_8px_20px_-6px_rgba(10,102,255,0.6)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <Link
          href="/"
          className="block text-center text-[0.82rem] font-semibold text-white/60 hover:text-[#FACC15] transition-colors"
        >
          &larr; Back to main site
        </Link>
      </div>
    </aside>
  );
}
