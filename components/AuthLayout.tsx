import Link from "next/link";
import ProgressArc from "./ProgressArc";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link href="/" className="mb-10 flex items-center gap-2.5">
          <ProgressArc size={32} strokeWidth={3} progress={72}>
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          </ProgressArc>
          <span className="font-display text-base font-bold tracking-tight">
            Tech Enable <span className="text-teal-dark">Solution</span>
          </span>
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-slate">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink md:flex md:items-center md:justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,184,166,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(245,165,36,0.18),transparent_40%)]" />
        <div className="relative flex flex-col items-center gap-6 px-12 text-center">
          <ProgressArc size={220} strokeWidth={8} progress={72}>
            <div className="flex flex-col items-center">
              <span className="font-display text-3xl font-bold text-white">72%</span>
              <span className="text-xs text-white/60">avg. completion</span>
            </div>
          </ProgressArc>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            &ldquo;Every module I finished filled in a little more of the
            ring. It sounds small, but it kept me coming back.&rdquo;
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            Student, Full-Stack Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
