"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export type CourseFormState = {
  error?: string;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCourseAction(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const isPremium = formData.get("is_premium") === "on";
  const priceNaira = Number(formData.get("price") ?? 0);

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug: slugify(title),
      description: String(formData.get("description") ?? ""),
      instructor: String(formData.get("instructor") ?? ""),
      category: String(formData.get("category") ?? ""),
      level: String(formData.get("level") ?? "beginner"),
      is_premium: isPremium,
      price_kobo: isPremium ? Math.round(priceNaira * 100) : 0,
      thumbnail_url: String(formData.get("thumbnail_url") ?? "") || null,
      duration_hours: Number(formData.get("duration_hours") ?? 0) || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}/edit?created=1`);
}

export async function updateCourseAction(
  courseId: string,
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const isPremium = formData.get("is_premium") === "on";
  const priceNaira = Number(formData.get("price") ?? 0);

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description: String(formData.get("description") ?? ""),
      instructor: String(formData.get("instructor") ?? ""),
      category: String(formData.get("category") ?? ""),
      level: String(formData.get("level") ?? "beginner"),
      is_premium: isPremium,
      price_kobo: isPremium ? Math.round(priceNaira * 100) : 0,
      thumbnail_url: String(formData.get("thumbnail_url") ?? "") || null,
      duration_hours: Number(formData.get("duration_hours") ?? 0) || null,
    })
    .eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return {};
}

export async function deleteCourseAction(courseId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("courses").delete().eq("id", courseId);
  revalidatePath("/admin/courses");
}

/**
 * Uploads a thumbnail to the "thumbnails" Supabase Storage bucket and
 * returns its public URL. Create this bucket (public) in your Supabase
 * project before using it: Storage -> New bucket -> "thumbnails" -> public.
 */
export async function uploadThumbnailAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const path = `thumbnails/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("thumbnails").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
  return { url: data.publicUrl };
}
