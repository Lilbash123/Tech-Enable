import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnrollButton from "@/components/EnrollButton";
import { createClient } from "@/lib/supabase/server";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let alreadyEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    alreadyEnrolled = Boolean(enrollment);
  }

  const priceLabel = course.is_premium
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(course.price_kobo / 100)
    : "Free";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="border-b border-line bg-white/60">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-teal-light px-3 py-1 font-semibold text-teal-dark">
              {course.category}
            </span>
            <span className="rounded-full bg-ink/5 px-3 py-1 font-semibold text-ink/60">
              {course.level}
            </span>
            {course.is_premium && (
              <span className="rounded-full bg-amber-light px-3 py-1 font-semibold text-amber-dark">
                Premium
              </span>
            )}
          </div>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold text-ink sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            {course.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 font-mono text-sm text-slate">
            <span>Taught by <strong className="font-body text-ink">{course.instructor}</strong></span>
            <span>★ {course.rating}</span>
            <span>{course.student_count.toLocaleString()} students</span>
            <span>{course.lesson_count} lessons · {course.duration_hours}h</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="card-surface p-6">
            <h2 className="font-display text-lg font-semibold text-ink">What you'll learn</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate sm:grid-cols-2">
              {[
                "Core concepts explained from first principles",
                "Hands-on projects you can add to a portfolio",
                "Best practices used in real production teams",
                "Lifetime access to course updates",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-teal-dark">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Course content</h2>
            <p className="mt-1 text-sm text-slate-light">
              {course.lesson_count} lessons · {course.duration_hours} hours total
            </p>
            <div className="mt-4 divide-y divide-line">
              {Array.from({ length: Math.min(5, course.lesson_count) }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-ink">Module {i + 1}: Getting started</span>
                  <span className="font-mono text-xs text-slate-light">
                    {Math.round(course.duration_hours * 12)}min
                  </span>
                </div>
              ))}
              {course.lesson_count > 5 && (
                <p className="py-3 text-sm text-slate-light">
                  + {course.lesson_count - 5} more lessons after enrolling
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card-surface p-6">
            <p className="font-display text-3xl font-bold text-ink">{priceLabel}</p>
            <p className="mt-1 text-xs text-slate-light">
              {course.is_premium ? "One-time payment · lifetime access" : "No payment required"}
            </p>
            <div className="mt-5">
              <EnrollButton
                course={course}
                userId={user?.id ?? null}
                userEmail={user?.email ?? null}
                alreadyEnrolled={alreadyEnrolled}
              />
            </div>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  );
}
