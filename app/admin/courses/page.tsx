import { createClient } from "@/lib/supabase/server";
import CourseTable from "@/components/admin/CourseTable";
import type { Course } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return <CourseTable courses={(courses ?? []) as Course[]} />;
}
