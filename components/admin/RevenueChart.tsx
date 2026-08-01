"use client";

// Requires: npm install recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { MonthlyRevenuePoint } from "@/lib/types/admin";

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function RevenueChart({ data }: { data: MonthlyRevenuePoint[] }) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatMonthLabel(point.month),
    revenueNaira: point.revenueKobo / 100,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[1rem] text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Revenue (last 12 months)
        </h3>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">No revenue recorded yet.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A66FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0A66FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatNaira(value * 100), "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: "0.85rem" }}
              />
              <Area type="monotone" dataKey="revenueNaira" stroke="#0A66FF" strokeWidth={2.5} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
