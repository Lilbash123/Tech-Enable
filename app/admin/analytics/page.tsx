import { createClient } from "@/lib/supabase/server";
import RevenueChart from "@/components/admin/RevenueChart";
import { PopularCoursesChart, StudentGrowthChart } from "@/components/admin/AnalyticsCharts";
import type { MonthlyRevenuePoint } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [{ data: successPayments }, { data: courses }, { data: profiles }] = await Promise.all([
    supabase.from("payments").select("amount_kobo, created_at").eq("status", "success"),
    supabase.from("courses").select("title, student_count").order("student_count", { ascending: false }).limit(6),
    supabase.from("profiles").select("created_at").eq("role", "student"),
  ]);

  // Monthly revenue, last 12 months
  const now = new Date();
  const revenueMonths: MonthlyRevenuePoint[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, revenueKobo: 0 };
  });
  (successPayments ?? []).forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = revenueMonths.find((m) => m.month === key);
    if (point) point.revenueKobo += p.amount_kobo ?? 0;
  });

  // Student growth, last 12 months (new signups per month)
  const growthMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), students: 0 };
  });
  (profiles ?? []).forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = growthMonths.find((m) => m.key === key);
    if (point) point.students += 1;
  });

  const popularCourses = (courses ?? []).map((c) => ({ title: c.title, students: c.student_count ?? 0 }));

  return (
    <div className="grid gap-6">
      <RevenueChart data={revenueMonths} />
      <div className="grid lg:grid-cols-2 gap-6">
        <PopularCoursesChart data={popularCourses} />
        <StudentGrowthChart data={growthMonths.map(({ label, students }) => ({ month: label, students }))} />
      </div>
    </div>
  );
}
