-- Tech Enable Solution LMS — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- 1. Profiles ----------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by the owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by the owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Courses -------------------------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  instructor text not null,
  category text not null,
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  is_premium boolean not null default false,
  price_kobo integer not null default 0, -- NGN * 100; 0 for free courses
  thumbnail_url text,
  lesson_count integer not null default 0,
  duration_hours numeric not null default 0,
  rating numeric not null default 4.8,
  student_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Courses are public to read"
  on public.courses for select
  using (true);

-- 3. Enrollments -----------------------------------------------------------
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  payment_reference text,
  unique (student_id, course_id)
);

alter table public.enrollments enable row level security;

create policy "Students view their own enrollments"
  on public.enrollments for select
  using (auth.uid() = student_id);

-- Students may enroll themselves directly ONLY in free courses.
-- Premium enrollments are inserted by the server (service role) after
-- Paystack verification, so no insert policy is needed for those.
create policy "Students enroll themselves in free courses"
  on public.enrollments for insert
  with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.courses c
      where c.id = course_id and c.is_premium = false
    )
  );

-- 4. Payments (audit trail for Paystack transactions) -----------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  reference text not null unique,
  amount_kobo integer not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Students view their own payments"
  on public.payments for select
  using (auth.uid() = student_id);

-- 5. Seed sample courses -----------------------------------------------
insert into public.courses
  (title, slug, description, instructor, category, level, is_premium, price_kobo, lesson_count, duration_hours, rating, student_count, thumbnail_url)
values
  ('HTML & CSS Foundations', 'html-css-foundations', 'Build your first responsive web pages from scratch — semantic HTML, modern CSS, and Flexbox/Grid layouts.', 'Ada Chukwu', 'Web Development', 'Beginner', false, 0, 32, 8, 4.7, 12400, null),
  ('JavaScript Essentials', 'javascript-essentials', 'A practical, project-based introduction to core JavaScript for absolute beginners.', 'Tunde Bakare', 'Web Development', 'Beginner', false, 0, 40, 10, 4.8, 15200, null),
  ('Intro to Data Analysis with Excel', 'intro-data-analysis-excel', 'Learn to clean, analyze, and visualize data using Excel — no prior experience required.', 'Ngozi Eze', 'Data', 'Beginner', false, 0, 24, 6, 4.6, 8100, null),
  ('Full-Stack Next.js & Supabase', 'fullstack-nextjs-supabase', 'Ship production apps with Next.js, Supabase auth/database, and real payment integration.', 'Kelechi Obi', 'Web Development', 'Advanced', true, 4500000, 68, 22, 4.9, 3400, null),
  ('React & TypeScript Mastery', 'react-typescript-mastery', 'Deep-dive into React patterns, hooks, and type-safe component architecture.', 'Femi Adeyemi', 'Web Development', 'Intermediate', true, 3800000, 54, 18, 4.8, 5200, null),
  ('Python for Data Science', 'python-for-data-science', 'Pandas, NumPy, and visualization libraries, taught through real Nigerian market datasets.', 'Aisha Bello', 'Data', 'Intermediate', true, 4200000, 60, 20, 4.9, 6100, null),
  ('UI/UX Design with Figma', 'ui-ux-design-figma', 'From wireframes to polished prototypes — a complete product design workflow in Figma.', 'Chidera Nwosu', 'Design', 'Intermediate', true, 3200000, 45, 15, 4.7, 4300, null),
  ('Cybersecurity Fundamentals', 'cybersecurity-fundamentals', 'Understand core security principles, threat modeling, and practical network defense.', 'Ibrahim Musa', 'IT & Security', 'Beginner', false, 0, 28, 9, 4.6, 9800, null)
on conflict (slug) do nothing;
