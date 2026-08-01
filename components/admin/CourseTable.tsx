"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Pencil, Trash2 } from "lucide-react";
import type { Course } from "@/lib/types/admin";
import { deleteCourseAction } from "@/app/admin/courses/actions";

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export default function CourseTable({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q) ||
        (c.instructor ?? "").toLowerCase().includes(q)
    );
  }, [courses, query]);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setPendingDeleteId(id);
    await deleteCourseAction(id);
    setPendingDeleteId(null);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
          />
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:-translate-y-0.5 transition-transform shrink-0"
        >
          Add Course
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Course</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Level</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Students</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((course) => (
              <tr key={course.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                      {course.thumbnail_url && (
                        <Image src={course.thumbnail_url} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">{course.title}</p>
                      <p className="text-xs text-slate-400">{course.instructor ?? "Unassigned"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{course.category ?? "—"}</td>
                <td className="px-5 py-3 text-slate-600 capitalize">{course.level ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      course.is_premium ? "bg-[#FACC15]/20 text-[#CA9A0A]" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {course.is_premium ? "Premium" : "Free"}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {course.is_premium ? formatNaira(course.price_kobo) : "—"}
                </td>
                <td className="px-5 py-3 text-slate-600">{course.student_count ?? 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0A66FF] hover:border-[#0A66FF] transition-colors"
                      aria-label={`Edit ${course.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(course.id, course.title)}
                      disabled={pendingDeleteId === course.id}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50"
                      aria-label={`Delete ${course.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                  No courses match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
