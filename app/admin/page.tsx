import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardCards from "@/components/admin/DashboardCards";
import RevenueChart from "@/components/admin/RevenueChart";
import PaymentTable from "@/components/admin/PaymentTable";
import type { DashboardStats, MonthlyRevenuePoint, Payment } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await createClient();

  const [{ count: totalStudents }, { count: totalCourses }, { data: successPayments }, { count: totalPayments }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("amount_kobo, created_at").eq("status", "success"),
      supabase.from("payments").select("id", { count: "exact", head: true }),
    ]);

  const totalRevenueKobo = (successPayments ?? []).reduce((sum, p) => sum + (p.amount_kobo ?? 0), 0);

  const stats: DashboardStats = {
    totalStudents: totalStudents ?? 0,
    totalCourses: totalCourses ?? 0,
    totalRevenueKobo,
    totalPayments: totalPayments ?? 0,
  };

  // Build last-12-months revenue series from the success payments we already fetched.
  const now = new Date();
  const months: MonthlyRevenuePoint[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, revenueKobo: 0 };
  });
  (successPayments ?? []).forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = months.find((m) => m.month === key);
    if (point) point.revenueKobo += p.amount_kobo ?? 0;
  });

  const { data: recentEnrollments } = await supabase
    .from("enrollments")
    .select("student_id, course_id, enrolled_at, profile:profiles(id, full_name, email), course:courses(id, title, thumbnail_url)")
    .order("enrolled_at", { ascending: false })
    .limit(5);

  const { data: recentPaymentsRaw } = await supabase
    .from("payments")
    .select(
  "id, student_id, course_id, amount_kobo, reference, status, created_at, profile:profiles(id, full_name, email), course:courses(id, title)"
)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    stats,
    months,
    recentEnrollments: recentEnrollments ?? [],
    recentPayments: (recentPaymentsRaw ?? []) as unknown as Payment[],
  };
}

export default async function AdminDashboardPage() {
  const { stats, months, recentEnrollments, recentPayments } = await getDashboardData();

  return (
    <div className="grid gap-6">
      <DashboardCards stats={stats} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={months} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[1rem] text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Recent Enrollments
            </h3>
            <Link href="/admin/students" className="text-xs font-semibold text-[#0A66FF]">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {recentEnrollments.length === 0 && <p className="text-sm text-slate-400">No enrollments yet.</p>}
            {recentEnrollments.map((e: any) => (
              <div key={`${e.student_id}-${e.course_id}`} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#FACC15] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {(e.profile?.full_name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{e.profile?.full_name ?? "Unknown"}</p>
                  <p className="text-xs text-slate-400 truncate">enrolled in {e.course?.title ?? "a course"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[1rem] text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Recent Payments
          </h3>
          <Link href="/admin/payments" className="text-xs font-semibold text-[#0A66FF]">
            View all
          </Link>
        </div>
        <PaymentTable payments={recentPayments} compact />
      </div>
    </div>
  );
}
