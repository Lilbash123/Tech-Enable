"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import type { Course } from "@/lib/types/admin";
import { uploadThumbnailAction, type CourseFormState } from "@/app/admin/courses/actions";

const CATEGORIES = [
  "AI Training",
  "Prompt Engineering",
  "Web Development",
  "Mobile App Development",
  "Graphic Design",
  "Video Editing",
  "Digital Marketing",
  "Computer Training",
  "Business Automation",
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0A66FF] text-white font-semibold text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function CourseForm({
  course,
  action,
  submitLabel,
}: {
  course?: Course;
  action: (state: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const [isPremium, setIsPremium] = useState(course?.is_premium ?? true);
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadThumbnailAction(fd);
    setUploading(false);
    if (result.url) setThumbnailUrl(result.url);
  }

  return (
    <form action={formAction} className="grid gap-6 max-w-3xl">
      {state.error && (
        <p className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{state.error}</p>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid gap-5">
        <div className="grid gap-1.5">
          <label htmlFor="title" className="text-sm font-semibold text-slate-600">
            Course title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={course?.title}
            required
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="description" className="text-sm font-semibold text-slate-600">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={course?.description ?? ""}
            rows={4}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF] resize-y"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="grid gap-1.5">
            <label htmlFor="instructor" className="text-sm font-semibold text-slate-600">
              Instructor
            </label>
            <input
              id="instructor"
              name="instructor"
              defaultValue={course?.instructor ?? ""}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="category" className="text-sm font-semibold text-slate-600">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={course?.category ?? CATEGORIES[0]}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="grid gap-1.5">
            <label htmlFor="level" className="text-sm font-semibold text-slate-600">
              Level
            </label>
            <select
              id="level"
              name="level"
              defaultValue={course?.level ?? "beginner"}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="duration_hours" className="text-sm font-semibold text-slate-600">
              Duration (hours)
            </label>
            <input
              id="duration_hours"
              name="duration_hours"
              type="number"
              min={0}
              defaultValue={course?.duration_hours ?? ""}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Premium course</p>
            <p className="text-xs text-slate-400">Toggle off to make this course free.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_premium"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-[#0A66FF] transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
          </label>
        </div>

        {isPremium && (
          <div className="grid gap-1.5 max-w-xs">
            <label htmlFor="price" className="text-sm font-semibold text-slate-600">
              Price (₦)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              defaultValue={course ? course.price_kobo / 100 : ""}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
            />
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid gap-4">
        <p className="text-sm font-semibold text-[#111827]">Thumbnail</p>
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
        <div className="flex items-center gap-4">
          <div className="w-28 h-20 rounded-xl bg-slate-100 overflow-hidden relative shrink-0">
            {thumbnailUrl && <Image src={thumbnailUrl} alt="" fill className="object-cover" />}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              id="thumbnail-file"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-[#0A66FF] hover:text-[#0A66FF] transition-colors disabled:opacity-60"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload image"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
