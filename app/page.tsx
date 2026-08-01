import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import ProgressArc from "@/components/ProgressArc";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("student_count", { ascending: false })
    .limit(6);

  const stats = [
    { value: "40+", label: "Courses" },
    { value: "68k+", label: "Students enabled" },
    { value: "4.8", label: "Average rating" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="animate-fade-up">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" /> Now enrolling for July
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Learn the skills that get you <span className="text-teal-dark">hired</span>.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate">
              Tech Enable Solution pairs free foundational courses with
              premium, mentor-built programs in web development, data,
              design, and IT — so progress is never gated behind a paywall,
              only accelerated by one.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Start learning free
              </Link>
              <Link href="/courses?type=premium" className="btn-outline">
                Browse premium courses
              </Link>
            </div>
            <div className="mt-12 flex gap-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-ink">{s.value}</p>
                  <p className="text-xs text-slate-light">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-md items-center justify-center md:flex">
            <ProgressArc size={340} strokeWidth={10} progress={72} className="drop-shadow-lift">
              <div className="flex flex-col items-center gap-1 rounded-full bg-white p-10 text-center shadow-card">
                <span className="font-display text-4xl font-bold text-ink">72%</span>
                <span className="text-xs text-slate-light">Avg. course completion</span>
              </div>
            </ProgressArc>
            <div className="absolute -left-4 bottom-8 card-surface flex items-center gap-3 px-4 py-3">
              <ProgressArc size={36} progress={100}>
                <span className="text-[10px] font-bold text-teal-dark">✓</span>
              </ProgressArc>
              <div>
                <p className="text-xs font-semibold">Payment secured</p>
                <p className="text-[11px] text-slate-light">via Paystack</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Tech Enable Solution */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Built for how people actually learn
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Free, forever courses",
              body: "Foundational tracks in web, data, and IT stay free indefinitely — enroll in one tap, no card required.",
            },
            {
              title: "Premium, mentor-built programs",
              body: "Go deeper with paid programs built by working engineers and designers, paid securely with Paystack.",
            },
            {
              title: "One dashboard, real progress",
              body: "Every enrollment — free or paid — lands in My Courses with a live progress ring, not a forgotten tab.",
            },
          ].map((f) => (
            <div key={f.title} className="card-surface p-6">
              <ProgressArc size={40} progress={60} className="mb-4" />
              <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular courses */}
      <section className="border-t border-line bg-white/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Popular right now
            </h2>
            <Link href="/courses" className="text-sm font-semibold text-teal-dark hover:underline">
              View all courses →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">
          Your progress ring is waiting to fill up.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-slate">
          Create a free account in under a minute and enroll in your first course today.
        </p>
        <Link href="/signup" className="btn-primary mt-8 inline-flex">
          Create your free account
        </Link>
      </section>

      <Footer />
    </div>
  );
}
