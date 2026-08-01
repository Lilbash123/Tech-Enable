export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  is_premium: boolean;
  price_kobo: number; // price in kobo (NGN * 100); 0 for free courses
  thumbnail_url: string | null;
  lesson_count: number;
  duration_hours: number;
  rating: number;
  student_count: number;
  created_at: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  progress: number; // 0–100
  enrolled_at: string;
  payment_reference: string | null;
};

export type EnrolledCourse = Enrollment & { course: Course };
