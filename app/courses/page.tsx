import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { createClient } from "@/lib/supabase/server";
import { clsx } from "clsx";

export const revalidate = 60;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const type =
    resolvedSearchParams.type === "premium"
      ? "premium"
      : resolvedSearchParams.type === "free"
        ? "free"
        : "all";

  let query = supabase.from("courses").select("*").order("student_count", { ascending: false });
  if (type === "premium") query = query.eq("is_premium", true);
  if (type === "free") query = query.eq("is_premium", false);
  if (resolvedSearchParams.category) query = query.eq("category", resolvedSearchParams.category);

  const { data: courses } = await query;
  const { data: allCourses } = await supabase.from("courses").select("category");
  const categories = Array.from(new Set(allCourses?.map((c) => c.category) ?? []));

  const tabs = [
    { key: "all", label: "All Courses" },
    { key: "free", label: "Free Courses" },
    { key: "premium", label: "Premium Courses" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="border-b border-line bg-white/60 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Course catalog</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">
            Find your next course
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate">
            Free foundations, premium mentor-built programs — all in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/courses" : `/courses?type=${tab.key}`}
                className={clsx(
                  "rounded-full px-5 py-2 text-sm font-semibold transition",
                  type === tab.key
                    ? "bg-ink text-white"
                    : "bg-white text-ink/70 border border-line hover:text-ink"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={type === "all" ? "/courses" : `/courses?type=${type}`}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition",
                  !resolvedSearchParams.category ? "bg-teal-light text-teal-dark" : "text-slate hover:text-ink"
                )}
              >
                All categories
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/courses?${type !== "all" ? `type=${type}&` : ""}category=${encodeURIComponent(c)}`}
                  className={clsx(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition",
                    resolvedSearchParams.category === c ? "bg-teal-light text-teal-dark" : "text-slate hover:text-ink"
                  )}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        {courses && courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="card-surface flex flex-col items-center gap-2 px-6 py-20 text-center">
            <p className="font-display text-base font-semibold text-ink">No courses found</p>
            <p className="text-sm text-slate">Try a different filter.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
