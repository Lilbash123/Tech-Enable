import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressArc from "@/components/ProgressArc";
import { createClient } from "@/lib/supabase/server";
import type { Course, Enrollment } from "@/lib/types";

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectedFrom=/my-courses");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  const typedEnrollments = (enrollments ?? []) as (Enrollment & { course: Course })[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="border-b border-line bg-white/60 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Your learning</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">My Courses</h1>
          <p className="mt-2 text-sm text-slate">
            Every course you've enrolled in — free or premium — lives here.
          </p>

          {resolvedSearchParams.success && (
            <div className="mt-6 rounded-xl bg-teal-light px-4 py-3 text-sm font-medium text-teal-dark">
              Payment successful — you're enrolled! 🎉
            </div>
          )}
          {resolvedSearchParams.error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              We couldn't confirm that payment. If you were charged, it will
              be reconciled automatically — contact support if it doesn't
              appear within a few minutes.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        {typedEnrollments.length === 0 ? (
          <div className="card-surface flex flex-col items-center gap-3 px-6 py-20 text-center">
            <ProgressArc size={56} progress={0} />
            <p className="font-display text-base font-semibold text-ink">
              You haven't enrolled in anything yet
            </p>
            <p className="max-w-sm text-sm text-slate">
              Browse the catalog and enroll in a free course to get started.
            </p>
            <Link href="/courses" className="btn-primary mt-2">Browse courses</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {typedEnrollments.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/courses/${enrollment.course_id}`}
                className="card-surface flex flex-col gap-4 p-5 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      enrollment.course?.is_premium
                        ? "rounded-full bg-amber-light px-3 py-1 text-[11px] font-semibold text-amber-dark"
                        : "rounded-full bg-teal-light px-3 py-1 text-[11px] font-semibold text-teal-dark"
                    }
                  >
                    {enrollment.course?.is_premium ? "Premium" : "Free"}
                  </span>
                  <ProgressArc size={40} strokeWidth={4} progress={enrollment.progress}>
                    <span className="font-mono text-[10px] font-semibold text-ink">
                      {enrollment.progress}%
                    </span>
                  </ProgressArc>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {enrollment.course?.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-light">{enrollment.course?.instructor}</p>
                </div>
                <div className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-light">
                  Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
