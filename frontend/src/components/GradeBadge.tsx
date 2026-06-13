/**
 * Grade Badge Component
 * Displays condition grade with color-coded styling.
 */

interface GradeBadgeProps {
  grade: 'A' | 'B' | 'C' | 'D';
  size?: 'sm' | 'md' | 'lg';
}

const gradeStyles = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  D: 'bg-red-100 text-red-800 border-red-300',
};

const gradeLabels = {
  A: 'Like New',
  B: 'Good',
  C: 'Fair',
  D: 'Damaged',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export default function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${gradeStyles[grade]} ${sizeClasses[size]}`}
    >
      Grade {grade}
      <span className="font-normal">· {gradeLabels[grade]}</span>
    </span>
  );
}
