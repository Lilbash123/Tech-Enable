"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
// Assumes a browser-side Supabase client factory following the standard
// @supabase/ssr pattern. Update the import if yours lives elsewhere.
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS } from "./AdminSidebar";
import type { Profile } from "@/lib/types/admin";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/courses": "Courses",
  "/admin/courses/new": "Add Course",
  "/admin/lessons": "Lessons",
  "/admin/students": "Students",
  "/admin/payments": "Payments",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/admin/courses/")) return "Edit Course";
  if (pathname.startsWith("/admin/students/")) return "Student Profile";
  return "Admin";
}

export default function AdminNavbar({ admin }: { admin: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-[76px] px-5 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center"
            aria-label="Open admin menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5 text-[#111827]" />
          </button>
          <h1 className="font-semibold text-[1.2rem] text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {resolveTitle(pathname)}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-[0.85rem] font-semibold text-[#111827]">
              {admin.full_name ?? "Admin"}
            </span>
            <span className="text-[0.72rem] text-slate-400">{admin.email}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#FACC15] flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {(admin.full_name ?? "A").charAt(0).toUpperCase()}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-slate-500 hover:text-[#0A66FF] transition-colors px-2 py-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Mobile nav drawer (sidebar equivalent below the lg breakpoint) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#111827] text-white p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Admin menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.9rem] font-medium text-white/80 hover:bg-white/5"
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
