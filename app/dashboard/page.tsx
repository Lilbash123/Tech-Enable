import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressArc from "@/components/ProgressArc";
import { createClient } from "@/lib/supabase/server";
import type { Course, Enrollment } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
if (profile?.role === "admin") {
  redirect("/admin");
}
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  const typedEnrollments = (enrollments ?? []) as (Enrollment & { course: Course })[];
  const firstName = (profile?.full_name || user.email || "Student").split(" ")[0];

  const totalCourses = typedEnrollments.length;
  const completed = typedEnrollments.filter((e) => e.progress >= 100).length;
  const avgProgress = totalCourses
    ? Math.round(typedEnrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
    : 0;
  const premiumOwned = typedEnrollments.filter((e) => e.course?.is_premium).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="border-b border-line bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Your dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink">
              Hello, {firstName} 👋
            </h1>
            <p className="mt-2 text-sm text-slate">
              {totalCourses === 0
                ? "You haven't enrolled in any courses yet — let's fix that."
                : `You're enrolled in ${totalCourses} course${totalCourses === 1 ? "" : "s"}, ${completed} completed.`}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/courses?type=free" className="btn-primary">Browse free courses</Link>
              <Link href="/courses?type=premium" className="btn-outline">Explore premium</Link>
            </div>
          </div>

          <ProgressArc size={140} strokeWidth={8} progress={avgProgress}>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-ink">{avgProgress}%</span>
              <span className="text-[11px] text-slate-light">avg. progress</span>
            </div>
          </ProgressArc>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Enrolled courses" value={totalCourses} />
          <StatCard label="Completed" value={completed} />
          <StatCard label="Premium courses owned" value={premiumOwned} />
        </div>

        <div className="mt-12 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">Continue learning</h2>
          <Link href="/my-courses" className="text-sm font-semibold text-teal-dark hover:underline">
            View all my courses →
          </Link>
        </div>

        {typedEnrollments.length === 0 ? (
          <div className="card-surface mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
            <ProgressArc size={56} progress={0} />
            <p className="font-display text-base font-semibold text-ink">No courses yet</p>
            <p className="max-w-sm text-sm text-slate">
              Enroll in a free course to get your first progress ring started, or go premium for a mentor-built program.
            </p>
            <Link href="/courses" className="btn-primary mt-2">Browse all courses</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typedEnrollments.slice(0, 6).map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/courses/${enrollment.course_id}`}
                className="card-surface flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <ProgressArc size={52} strokeWidth={5} progress={enrollment.progress}>
                  <span className="font-mono text-xs font-semibold text-ink">
                    {enrollment.progress}%
                  </span>
                </ProgressArc>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-ink">
                    {enrollment.course?.title}
                  </p>
                  <p className="text-xs text-slate-light">{enrollment.course?.instructor}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-surface p-6">
      <p className="font-display text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm text-slate-light">{label}</p>
    </div>
  );
}
