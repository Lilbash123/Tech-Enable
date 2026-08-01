type ProgressArcProps = {
  progress?: number; // 0–100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
};

/**
 * The Progress Arc is Tech Enable Solution's signature mark: a ring that is
 * never quite closed — standing in for a learner's progress and for the
 * brand's promise of "enablement in progress." It appears as the logo, as
 * avatar/course-card rings, and as literal progress indicators.
 */
export default function ProgressArc({
  progress = 68,
  size = 40,
  strokeWidth = 3,
  className = "",
  children,
}: ProgressArcProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="progress-arc-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-arc-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
