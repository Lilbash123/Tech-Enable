import type { Payment } from "@/lib/types/admin";

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const STATUS_STYLES: Record<Payment["status"], string> = {
  success: "bg-emerald-100 text-emerald-700",
  pending: "bg-[#FACC15]/20 text-[#CA9A0A]",
  failed: "bg-red-100 text-red-600",
};

export default function PaymentTable({
  payments,
  compact = false,
}: {
  payments: Payment[];
  compact?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {!compact && (
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-[1rem] text-[#111827]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Payment history
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Student</th>
              <th className="px-5 py-3 font-semibold">Course</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Reference</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <p className="font-semibold text-[#111827]">{payment.profile?.full_name ?? "Unknown"}</p>
                  <p className="text-xs text-slate-400">{payment.profile?.email}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{payment.course?.title ?? "—"}</td>
                <td className="px-5 py-3 font-semibold text-[#111827]">{formatNaira(payment.amount_kobo)}</td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{payment.reference}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[payment.status]}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(payment.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
