import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId." }, { status: 400 });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
  if (!course.is_premium) {
    return NextResponse.json({ error: "This course is free — no payment needed." }, { status: 400 });
  }

  // Already enrolled? Don't let them pay twice.
  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingEnrollment) {
    return NextResponse.json({ error: "You're already enrolled in this course." }, { status: 400 });
  }

  const reference = `TES-${courseId.slice(0, 8)}-${Date.now()}`;

  const { error: paymentInsertError } = await supabase.from("payments").insert({
    student_id: user.id,
    course_id: courseId,
    reference,
    amount_kobo: course.price_kobo,
    status: "pending",
  });

  if (paymentInsertError) {
  return NextResponse.json(
    {
      error: paymentInsertError.message,
      details: paymentInsertError,
    },
    { status: 500 }
  );
}

  try {
    const origin = request.nextUrl.origin;
    const paystackRes = await initializeTransaction({
      email: user.email!,
      amountKobo: course.price_kobo,
      reference,
      metadata: {
        courseId,
        studentId: user.id,
        courseTitle: course.title,
      },
      callbackUrl: `${origin}/api/paystack/verify`,
    });

    return NextResponse.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not reach Paystack. Please try again shortly." },
      { status: 502 }
    );
  }
}
