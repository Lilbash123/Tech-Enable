"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export type SettingsFormState = { error?: string; success?: boolean };

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: String(formData.get("site_name") ?? ""),
      logo_url: String(formData.get("logo_url") ?? "") || null,
      contact_email: String(formData.get("contact_email") ?? "") || null,
      contact_phone: String(formData.get("contact_phone") ?? "") || null,
      whatsapp_link: String(formData.get("whatsapp_link") ?? "") || null,
      facebook_url: String(formData.get("facebook_url") ?? "") || null,
      instagram_url: String(formData.get("instagram_url") ?? "") || null,
      twitter_url: String(formData.get("twitter_url") ?? "") || null,
      youtube_url: String(formData.get("youtube_url") ?? "") || null,
      linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}

/** Uploads a logo to the "branding" Supabase Storage bucket (create as public). */
export async function uploadLogoAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const path = `logo/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return { url: data.publicUrl };
}
