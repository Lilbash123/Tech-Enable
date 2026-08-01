import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Paystack calls this server-to-server whenever a transaction event occurs.
 * This is the source of truth for enrollment — it works even if the
 * student closes their browser tab before the /api/paystack/verify
 * redirect fires. Configure this URL in the Paystack dashboard under
 * Settings → API Keys & Webhooks.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const rawBody = await request.text();

  const signature = request.headers.get("x-paystack-signature");
  const expectedSignature = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

  if (!signature || signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const { reference, metadata } = event.data;
    const supabase = await createAdminClient();

    await supabase.from("payments").update({ status: "success" }).eq("reference", reference);

    const courseId = metadata?.courseId;
    const studentId = metadata?.studentId;

    if (courseId && studentId) {
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (!existingEnrollment) {
        await supabase.from("enrollments").insert({
          student_id: studentId,
          course_id: courseId,
          payment_reference: reference,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
