export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "student" | "admin";
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor: string | null;
  category: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  is_premium: boolean;
  price_kobo: number;
  thumbnail_url: string | null;
  lesson_count: number;
  duration_hours: number | null;
  rating: number | null;
  student_count: number | null;
  created_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  position: number;
  video_url: string | null;
  pdf_url: string | null;
  has_quiz: boolean;
  quiz: QuizQuestion[] | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correct_index: number;
};

export type Enrollment = {
  student_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  payment_reference: string | null;
  // joined
  profile?: Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
  course?: Pick<Course, "id" | "title" | "thumbnail_url">;
};

export type PaymentStatus = "pending" | "success" | "failed";

export type Payment = {
  id: string;
  user_id: string;
  course_id: string;
  amount_kobo: number;
  reference: string;
  status: PaymentStatus;
  provider: string;
  created_at: string;
  // joined
  profile?: Pick<Profile, "id" | "full_name" | "email">;
  course?: Pick<Course, "id" | "title">;
};

export type SiteSettings = {
  id: number;
  site_name: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_link: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  updated_at: string;
};

export type DashboardStats = {
  totalStudents: number;
  totalCourses: number;
  totalRevenueKobo: number;
  totalPayments: number;
};

export type MonthlyRevenuePoint = {
  month: string; // e.g. "2026-06"
  revenueKobo: number;
};
