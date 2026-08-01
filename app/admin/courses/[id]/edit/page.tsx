import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CourseForm from "@/components/admin/CourseForm";
import { updateCourseAction } from "@/app/admin/courses/actions";
import type { Course } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();

  if (!course) notFound();

  const boundAction = updateCourseAction.bind(null, id);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Edit course
          </h2>
          <p className="text-sm text-slate-500 mt-1">{course.title}</p>
        </div>
        <Link href={`/admin/lessons?course=${course.id}`} className="text-sm font-semibold text-[#0A66FF]">
          Manage lessons &rarr;
        </Link>
      </div>
      <CourseForm course={course as Course} action={boundAction} submitLabel="Save changes" />
    </div>
  );
}
