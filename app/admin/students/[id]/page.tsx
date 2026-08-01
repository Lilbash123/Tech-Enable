import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, created_at")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, progress_percent, enrolled_at, course:courses(id, title, thumbnail_url, category)")
    .eq("user_id", id)
    .order("enrolled_at", { ascending: false });

  return (
    <div className="grid gap-6 max-w-3xl">
      <Link href="/admin/students" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A66FF]">
        <ArrowLeft className="w-4 h-4" /> Back to students
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#FACC15] flex items-center justify-center text-white font-semibold text-xl shrink-0">
          {(profile.full_name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {profile.full_name ?? "Unnamed student"}
          </h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            Joined {new Date(profile.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-[#111827] mb-3">Enrolled courses</h3>
        <div className="grid gap-3">
          {(enrollments ?? []).length === 0 && (
            <p className="text-sm text-slate-400 bg-white border border-slate-200 rounded-2xl p-6 text-center">
              Not enrolled in any courses yet.
            </p>
          )}
          {(enrollments ?? []).map((e: any) => (
            <div key={e.course_id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111827] truncate">{e.course?.title ?? "Unknown course"}</p>
                <p className="text-xs text-slate-400">{e.course?.category}</p>
                <div className="flex items-center gap-2 mt-2 max-w-xs">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0A66FF] to-[#FACC15]"
                      style={{ width: `${e.progress_percent ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8">{e.progress_percent ?? 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
