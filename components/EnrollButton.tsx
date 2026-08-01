"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/lib/types";

export default function EnrollButton({
  course,
  userId,
  userEmail,
  alreadyEnrolled,
}: {
  course: Course;
  userId: string | null;
  userEmail: string | null;
  alreadyEnrolled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  if (alreadyEnrolled) {
    return (
      <button className="btn-outline w-full cursor-default" disabled>
        ✓ You're enrolled
      </button>
    );
  }

  async function handleFreeEnroll() {
    if (!userId) {
      router.push(`/login?redirectedFrom=/courses/${course.id}`);
      return;
    }
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("enrollments").insert({
      student_id: userId,
      course_id: course.id,
    });

    setLoading(false);

    if (insertError) {
      setError("Something went wrong enrolling you. Please try again.");
      return;
    }

    router.push("/my-courses");
    router.refresh();
  }

  async function handlePremiumCheckout() {
    if (!userId || !userEmail) {
      router.push(`/login?redirectedFrom=/courses/${course.id}`);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.authorizationUrl) {
        throw new Error(data.error || "Could not start payment.");
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={course.is_premium ? handlePremiumCheckout : handleFreeEnroll}
        disabled={loading}
        className={course.is_premium ? "btn-amber w-full" : "btn-primary w-full"}
      >
        {loading
          ? "Please wait…"
          : course.is_premium
          ? `Pay & Enroll — ${new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0,
            }).format(course.price_kobo / 100)}`
          : "Enroll for free"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {course.is_premium && (
        <p className="text-center text-xs text-slate-light">
          Secure checkout powered by Paystack
        </p>
      )}
    </div>
  );
}
