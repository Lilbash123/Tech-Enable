"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProgressArc from "./ProgressArc";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(
        (data.user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
          data.user?.email?.split("@")[0] ??
          null
      );
      setLoading(false);
    });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/courses?type=free", label: "Free Courses" },
    { href: "/courses?type=premium", label: "Premium Courses" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <ProgressArc size={34} strokeWidth={3} progress={72}>
            <span className="h-2 w-2 rounded-full bg-ink" />
          </ProgressArc>
          <span className="font-display text-lg font-bold tracking-tight">
            Tech Enable <span className="text-teal-dark">Solution</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : userName ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-ink/70 hover:text-ink">
                Hello, {userName}
              </Link>
              <Link href="/my-courses" className="btn-outline">
                My Courses
              </Link>
              <button onClick={handleSignOut} className="btn-primary">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">
                Log In
              </Link>
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-ink" />
            <span className="block h-0.5 w-5 bg-ink" />
            <span className="block h-0.5 w-5 bg-ink" />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium">
                {link.label}
              </Link>
            ))}
            {userName ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium">
                  Hello, {userName}
                </Link>
                <Link href="/my-courses" onClick={() => setMenuOpen(false)} className="btn-outline w-full">
                  My Courses
                </Link>
                <button onClick={handleSignOut} className="btn-primary w-full">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-outline w-full">
                  Log In
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-primary w-full">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
