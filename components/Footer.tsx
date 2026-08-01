import Link from "next/link";
import ProgressArc from "./ProgressArc";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <ProgressArc size={30} strokeWidth={3} progress={72}>
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </ProgressArc>
              <span className="font-display text-base font-bold text-white">
                Tech Enable Solution
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Practical, job-ready courses in web development, data, design,
              and IT — built for learners who are enabling their own future.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Learn</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/courses?type=free" className="hover:text-white">Free Courses</Link></li>
              <li><Link href="/courses?type=premium" className="hover:text-white">Premium Courses</Link></li>
              <li><Link href="/my-courses" className="hover:text-white">My Courses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Account</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/signup" className="hover:text-white">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-white">Log In</Link></li>
              <li><Link href="/forgot-password" className="hover:text-white">Forgot Password</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tech Enable Solution. All rights reserved.</p>
          <p>Payments secured by Paystack</p>
        </div>
      </div>
    </footer>
  );
}
