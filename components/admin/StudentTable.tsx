"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";

export type StudentRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  enrolledCount: number;
  avgProgress: number; // 0-100
};

export default function StudentTable({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => (s.full_name ?? "").toLowerCase().includes(q) || (s.email ?? "").toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Student</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold">Enrolled Courses</th>
              <th className="px-5 py-3 font-semibold">Avg. Progress</th>
              <th className="px-5 py-3 font-semibold text-right">Profile</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#FACC15] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {(student.full_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">{student.full_name ?? "Unnamed"}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {new Date(student.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3 text-slate-600">{student.enrolledCount}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0A66FF] to-[#FACC15]"
                        style={{ width: `${student.avgProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8">{student.avgProgress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="inline-flex items-center gap-1 text-[#0A66FF] font-semibold text-xs hover:gap-1.5 transition-all"
                  >
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  No students match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
