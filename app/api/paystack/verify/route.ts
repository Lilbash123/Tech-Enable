import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack";

/**
 * Paystack redirects the browser here after checkout (this is the
 * `callback_url` passed to /transaction/initialize). We independently
 * verify the transaction with Paystack's servers before enrolling anyone —
 * never trust the redirect alone, since query params can be forged.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const origin = request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${origin}/my-courses?error=missing_reference`);
  }

  const supabase = await createAdminClient();

  try {
    const verification = await verifyTransaction(reference);

    if (verification.data.status !== "success") {
      await supabase.from("payments").update({ status: "failed" }).eq("reference", reference);
      return NextResponse.redirect(`${origin}/my-courses?error=payment_failed`);
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (!payment) {
      return NextResponse.redirect(`${origin}/my-courses?error=payment_not_found`);
    }

    // Idempotent: mark the payment successful, then enroll if not already enrolled.
    await supabase.from("payments").update({ status: "success" }).eq("reference", reference);

    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", payment.student_id)
      .eq("course_id", payment.course_id)
      .maybeSingle();

    if (!existingEnrollment) {
      await supabase.from("enrollments").insert({
        student_id: payment.student_id,
        course_id: payment.course_id,
        payment_reference: reference,
      });
    }

    return NextResponse.redirect(`${origin}/my-courses?success=1`);
  } catch (err) {
    return NextResponse.redirect(`${origin}/my-courses?error=verification_failed`);
  }
}
