import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LessonManager from "@/components/admin/LessonManager";
import type { Course, Lesson } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("id, title").order("title");

  const selectedCourseId = resolvedSearchParams.course ?? courses?.[0]?.id;

  let lessons: Lesson[] = [];
  if (selectedCourseId) {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", selectedCourseId)
      .order("position");
    lessons = (data ?? []) as Lesson[];
  }

  return (
    <div className="grid gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <label htmlFor="course-picker" className="text-sm font-semibold text-slate-600 block mb-2">
          Select a course to manage its lessons
        </label>
        <div className="flex flex-wrap gap-2">
          {(courses ?? []).map((c: Pick<Course, "id" | "title">) => (
            <Link
              key={c.id}
              href={`/admin/lessons?course=${c.id}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                c.id === selectedCourseId
                  ? "bg-[#0A66FF] text-white border-[#0A66FF]"
                  : "border-slate-200 text-slate-600 hover:border-[#0A66FF] hover:text-[#0A66FF]"
              }`}
            >
              {c.title}
            </Link>
          ))}
          {(!courses || courses.length === 0) && (
            <p className="text-sm text-slate-400">
              No courses yet —{" "}
              <Link href="/admin/courses/new" className="text-[#0A66FF] font-semibold">
                create one first
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {selectedCourseId && <LessonManager courseId={selectedCourseId} initialLessons={lessons} />}
    </div>
  );
}
