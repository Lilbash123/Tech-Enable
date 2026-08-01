import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export const metadata = {
  title: "Admin · Tech Enable Solution",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: middleware.ts already blocks non-admins from ever
  // reaching this layout, but we re-check here so admin data is never even
  // queried by a page unless this resolves.
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar admin={admin} />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
