"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import type { QuizQuestion } from "@/lib/types/admin";

export async function createLessonAction(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!courseId || !title) return { error: "Course and title are required." };

  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    position: count ?? 0,
    video_url: String(formData.get("video_url") ?? "") || null,
    pdf_url: String(formData.get("pdf_url") ?? "") || null,
    duration_minutes: Number(formData.get("duration_minutes") ?? 0) || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/lessons");
  return {};
}

export async function deleteLessonAction(lessonId: string, courseId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);
  revalidatePath(`/admin/lessons?course=${courseId}`);
}

/**
 * Persists a full reordered list of lesson IDs for a course (position = index).
 * Called after the admin moves a lesson up/down in LessonManager.
 */
export async function reorderLessonsAction(courseId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("lessons").update({ position: index }).eq("id", id))
  );
  revalidatePath(`/admin/lessons?course=${courseId}`);
}

export async function setLessonQuizAction(
  lessonId: string,
  courseId: string,
  quiz: QuizQuestion[]
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ has_quiz: quiz.length > 0, quiz: quiz.length > 0 ? quiz : null })
    .eq("id", lessonId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/lessons?course=${courseId}`);
  return {};
}

/**
 * Uploads a lesson video to the "lesson-videos" bucket (create as public in
 * Supabase Storage) and returns its public URL.
 */
export async function uploadLessonVideoAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const path = `videos/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("lesson-videos").upload(path, file, { upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("lesson-videos").getPublicUrl(path);
  return { url: data.publicUrl };
}

/**
 * Uploads a lesson PDF to the "lesson-pdfs" bucket (create as public in
 * Supabase Storage) and returns its public URL.
 */
export async function uploadLessonPdfAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const path = `pdfs/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("lesson-pdfs").upload(path, file, { upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("lesson-pdfs").getPublicUrl(path);
  return { url: data.publicUrl };
}
