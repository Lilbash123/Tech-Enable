import { createClient } from "@/lib/supabase/server";
import PaymentTable from "@/components/admin/PaymentTable";
import type { Payment } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(
  "id, student_id, course_id, amount_kobo, reference, status, created_at, profile:profiles(id, full_name, email), course:courses(id, title)"
)
    .order("created_at", { ascending: false });

  return <PaymentTable payments={(payments ?? []) as unknown as Payment[]} />;
}
