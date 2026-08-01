import { redirect } from "next/navigation";
// Assumes you already have a server-side Supabase client factory at this path,
// following the standard @supabase/ssr App Router pattern. If yours lives
// somewhere else, update this import only.
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/admin";

/**
 * Call at the top of every /admin server component (layout + each page, for
 * defense-in-depth alongside middleware.ts). Returns the current admin's
 * profile, or redirects a non-admin away before any admin data is queried.
 */
export async function requireAdmin(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, created_at")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return profile as Profile;
}
