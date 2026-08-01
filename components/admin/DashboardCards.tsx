import { Users, BookOpen, Wallet, Receipt } from "lucide-react";
import type { DashboardStats } from "@/lib/types/admin";

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export default function DashboardCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      accent: "bg-[#0A66FF]/10 text-[#0A66FF]",
    },
    {
      label: "Total Courses",
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      accent: "bg-[#FACC15]/15 text-[#CA9A0A]",
    },
    {
      label: "Total Revenue",
      value: formatNaira(stats.totalRevenueKobo),
      icon: Wallet,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Total Payments",
      value: stats.totalPayments.toLocaleString(),
      icon: Receipt,
      accent: "bg-[#111827]/10 text-[#111827]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="bg-white border border-slate-200 rounded-2xl p-6 transition-transform hover:-translate-y-1 hover:shadow-lg"
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="mt-4 text-[1.55rem] font-semibold text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {value}
          </p>
          <p className="text-[0.82rem] text-slate-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
