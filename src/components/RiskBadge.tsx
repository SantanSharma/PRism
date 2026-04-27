import { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const levelConfig: Record<RiskLevel, { bg: string; text: string; border: string; label: string; icon: string }> = {
  low: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
    label: 'Low Risk',
    icon: '✓',
  },
  medium: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    label: 'Medium Risk',
    icon: '⚡',
  },
  high: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    label: 'High Risk',
    icon: '⚠',
  },
  critical: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    label: 'Critical',
    icon: '🔥',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2',
};

export function RiskBadge({ level, size = 'md', showLabel = true }: RiskBadgeProps) {
  const config = levelConfig[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border
                  ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export function RiskScore({ score, level }: { score: number; level: RiskLevel }) {
  const config = levelConfig[level];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-800"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${score * 2.51} 251`}
            strokeLinecap="round"
            className={config.text}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${config.text}`}>{score}</span>
        </div>
      </div>
      <RiskBadge level={level} size="lg" />
    </div>
  );
}
