import Link from "next/link";
import type { Course } from "@/lib/types";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const categoryGradients: Record<string, string> = {
  "Web Development": "from-teal/25 to-ink/10",
  Data: "from-amber/25 to-ink/10",
  Design: "from-teal/20 to-amber/15",
  "IT & Security": "from-ink/15 to-teal/15",
};

export default function CourseCard({ course }: { course: Course }) {
  const gradient = categoryGradients[course.category] ?? "from-teal/20 to-ink/10";

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl2 border border-line bg-card shadow-card transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${gradient} font-display text-3xl font-bold text-ink/30`}>
        {course.title.slice(0, 1)}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/70">
          {course.category}
        </span>
        {course.is_premium ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber px-3 py-1 text-[11px] font-semibold text-ink">
            Premium
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-teal px-3 py-1 text-[11px] font-semibold text-white">
            Free
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-ink group-hover:text-teal-dark">
          {course.title}
        </h3>
        <p className="text-sm text-slate line-clamp-2">{course.description}</p>
        <p className="text-xs font-medium text-slate-light">{course.instructor}</p>

        <div className="mt-auto flex items-center justify-between pt-3 font-mono text-xs text-slate">
          <span>{course.lesson_count} lessons · {course.duration_hours}h</span>
          <span className="flex items-center gap-1 text-amber-dark">★ {course.rating}</span>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs text-slate-light">{course.student_count.toLocaleString()} students</span>
          <span className="font-display text-sm font-bold text-ink">
            {course.is_premium ? formatNaira(course.price_kobo) : "Free"}
          </span>
        </div>
      </div>
    </Link>
  );
}
