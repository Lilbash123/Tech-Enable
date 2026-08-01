import CourseForm from "@/components/admin/CourseForm";
import { createCourseAction } from "@/app/admin/courses/actions";

export default function NewCoursePage() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Add a new course
        </h2>
        <p className="text-sm text-slate-500 mt-1">Fill in the details below — you can add lessons after creating the course.</p>
      </div>
      <CourseForm action={createCourseAction} submitLabel="Create course" />
    </div>
  );
}
