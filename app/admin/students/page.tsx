import { createClient } from "@/lib/supabase/server";
import StudentTable, { type StudentRow } from "@/components/admin/StudentTable";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, progress");

  const rows: StudentRow[] = (profiles ?? []).map((p) => {
    const own = (enrollments ?? []).filter(
  (e) => e.student_id === p.id
);

const avgProgress = own.length
  ? Math.round(
      own.reduce((sum, e) => sum + (e.progress ?? 0), 0) /
      own.length
    )
  : 0;
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      created_at: p.created_at,
      enrolledCount: own.length,
      avgProgress,
    };
  });

  return <StudentTable students={rows} />;
}
