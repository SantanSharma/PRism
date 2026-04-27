'use client';

import { PRAnalysis, RiskLevel } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface CompactSummaryProps {
  analysis: PRAnalysis;
}

export function CompactSummary({ analysis }: CompactSummaryProps) {
  const { theme } = useTheme();
  const { pr, riskScore, testCoverage, stats, files } = analysis;

  const getRiskColor = (level: RiskLevel) => {
    const colors: Record<RiskLevel, string> = {
      low: theme.colors.riskLow,
      medium: theme.colors.riskMedium,
      high: theme.colors.riskHigh,
      critical: theme.colors.riskCritical,
    };
    return colors[level];
  };

  const riskColor = getRiskColor(riskScore.level);

  return (
    <div 
      className="h-full overflow-y-auto p-6"
      style={{ background: theme.colors.bgPrimary }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Risk Score & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Score Card */}
          <div 
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${riskColor}15 0%, ${riskColor}05 100%)`,
              border: `2px solid ${riskColor}30`,
            }}
          >
            {/* Decorative glow */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{ background: riskColor }}
            />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: theme.colors.textMuted }}>
                    Risk Score
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black" style={{ color: riskColor }}>
                      {riskScore.score}
                    </span>
                    <span className="text-xl font-bold" style={{ color: theme.colors.textMuted }}>/100</span>
                  </div>
                </div>
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: `${riskColor}20` }}
                >
                  {riskScore.level === 'critical' ? '🔥' : riskScore.level === 'high' ? '⚠️' : riskScore.level === 'medium' ? '⚡' : '✅'}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: theme.colors.bgTertiary }}>
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${riskScore.score}%`,
                    background: `linear-gradient(90deg, ${riskColor}, ${riskColor}cc)`,
                    boxShadow: `0 0 20px ${riskColor}60`,
                  }}
                />
              </div>

              <span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                style={{ 
                  background: `${riskColor}20`,
                  color: riskColor,
                  border: `1px solid ${riskColor}40`,
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: riskColor }} />
                {riskScore.level} Risk
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              icon="📄" 
              label="Total Files" 
              value={stats.totalFiles} 
              theme={theme}
            />
            <StatCard 
              icon="💻" 
              label="Source Files" 
              value={stats.sourceFiles} 
              theme={theme}
            />
            <StatCard 
              icon="➕" 
              label="Additions" 
              value={pr.additions}
              color={theme.colors.statusAdded}
              theme={theme}
            />
            <StatCard 
              icon="➖" 
              label="Deletions" 
              value={pr.deletions}
              color={theme.colors.statusRemoved}
              theme={theme}
            />
          </div>

          {/* File Breakdown */}
          <div 
            className="rounded-3xl p-6"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: theme.colors.textMuted }}>
              Risk Distribution
            </h3>
            <div className="space-y-4">
              <RiskBar 
                label="Critical" 
                count={files.filter(f => f.riskLevel === 'critical').length} 
                total={files.length}
                color={theme.colors.riskCritical}
                theme={theme}
              />
              <RiskBar 
                label="High" 
                count={files.filter(f => f.riskLevel === 'high').length} 
                total={files.length}
                color={theme.colors.riskHigh}
                theme={theme}
              />
              <RiskBar 
                label="Medium" 
                count={files.filter(f => f.riskLevel === 'medium').length} 
                total={files.length}
                color={theme.colors.riskMedium}
                theme={theme}
              />
              <RiskBar 
                label="Low" 
                count={files.filter(f => f.riskLevel === 'low').length} 
                total={files.length}
                color={theme.colors.riskLow}
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Middle Column - PR Info & Test Coverage */}
        <div className="lg:col-span-4 space-y-6">
          {/* PR Info */}
          <div 
            className="rounded-3xl p-6"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: theme.colors.textMuted }}>
              Pull Request
            </h3>
            <h4 
              className="text-xl font-bold mb-4 leading-tight"
              style={{ color: theme.colors.textPrimary }}
            >
              {pr.title}
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <Chip icon="👤" label={`@${pr.author}`} theme={theme} />
              <Chip icon="🔀" label={`${pr.headBranch} → ${pr.baseBranch}`} theme={theme} />
              <Chip 
                icon={pr.state === 'open' ? '🟢' : '🟣'} 
                label={pr.state} 
                theme={theme} 
              />
            </div>
            <a
              href={pr.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ 
                background: theme.colors.bgTertiary,
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.borderSecondary}`,
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Test Coverage */}
          <div 
            className="rounded-3xl p-6"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>
                Test Coverage
              </h3>
              <span className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                {testCoverage.hasTests} / {testCoverage.hasTests + testCoverage.missingTests}
              </span>
            </div>
            <div 
              className="h-4 rounded-full overflow-hidden mb-4"
              style={{ background: theme.colors.bgTertiary }}
            >
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(testCoverage.hasTests / Math.max(1, testCoverage.hasTests + testCoverage.missingTests)) * 100}%`,
                  background: `linear-gradient(90deg, ${theme.colors.riskLow}, ${theme.colors.riskLow}cc)`,
                  boxShadow: `0 0 12px ${theme.colors.riskLow}40`,
                }}
              />
            </div>
            {testCoverage.missingTests > 0 ? (
              <div 
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ 
                  background: `${theme.colors.riskMedium}15`,
                  border: `1px solid ${theme.colors.riskMedium}30`,
                }}
              >
                <span className="text-lg">⚠️</span>
                <span className="text-sm font-medium" style={{ color: theme.colors.riskMedium }}>
                  {testCoverage.missingTests} source file(s) may need tests
                </span>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ 
                  background: `${theme.colors.riskLow}15`,
                  border: `1px solid ${theme.colors.riskLow}30`,
                }}
              >
                <span className="text-lg">✅</span>
                <span className="text-sm font-medium" style={{ color: theme.colors.riskLow }}>
                  All source files have test coverage
                </span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div 
            className="rounded-3xl p-6"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: theme.colors.textMuted }}>
              Analysis Summary
            </h3>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: theme.colors.textSecondary }}
            >
              {riskScore.summary}
            </p>
          </div>
        </div>

        {/* Right Column - Factors & Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Factors */}
          {riskScore.factors.length > 0 && (
            <div 
              className="rounded-3xl p-6"
              style={{ 
                background: theme.colors.bgSecondary,
                border: `1px solid ${theme.colors.borderPrimary}`,
              }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: theme.colors.textMuted }}>
                Risk Factors
              </h3>
              <div className="space-y-3">
                {riskScore.factors.map((factor, i) => (
                  <FactorCard key={i} factor={factor} theme={theme} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {riskScore.recommendations.length > 0 && (
            <div 
              className="rounded-3xl p-6"
              style={{ 
                background: `linear-gradient(135deg, ${theme.colors.accentGradientFrom}10 0%, ${theme.colors.accentGradientTo}05 100%)`,
                border: `1px solid ${theme.colors.accentPrimary}30`,
              }}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: theme.colors.accentPrimary }}>
                <span>💡</span> Recommendations
              </h3>
              <ul className="space-y-3">
                {riskScore.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ 
                        background: theme.colors.accentPrimary,
                        color: '#fff',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span 
                      className="text-sm leading-relaxed"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color,
  theme,
}: { 
  icon: string; 
  label: string; 
  value: number;
  color?: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <div 
      className="rounded-2xl p-5"
      style={{ 
        background: theme.colors.bgSecondary,
        border: `1px solid ${theme.colors.borderPrimary}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>
          {label}
        </span>
      </div>
      <div 
        className="text-2xl font-black"
        style={{ color: color || theme.colors.textPrimary }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function RiskBar({ 
  label, 
  count, 
  total, 
  color,
  theme,
}: { 
  label: string; 
  count: number; 
  total: number;
  color: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-4">
      <span 
        className="text-xs font-semibold w-16"
        style={{ color: theme.colors.textMuted }}
      >
        {label}
      </span>
      <div 
        className="flex-1 h-3 rounded-full overflow-hidden"
        style={{ background: theme.colors.bgTertiary }}
      >
        <div 
          className="h-full rounded-full transition-all duration-700"
          style={{ 
            width: `${percentage}%`,
            background: color,
            boxShadow: percentage > 0 ? `0 0 8px ${color}60` : 'none',
          }} 
        />
      </div>
      <span 
        className="text-sm font-bold w-8 text-right"
        style={{ color: count > 0 ? color : theme.colors.textMuted }}
      >
        {count}
      </span>
    </div>
  );
}

function Chip({ 
  icon, 
  label,
  theme,
}: { 
  icon: string; 
  label: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
      style={{ 
        background: theme.colors.bgTertiary,
        color: theme.colors.textSecondary,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function FactorCard({ 
  factor, 
  theme 
}: { 
  factor: { name: string; description: string; impact: number; category: string };
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const getImpactColor = (impact: number) => {
    if (impact >= 8) return theme.colors.riskCritical;
    if (impact >= 5) return theme.colors.riskHigh;
    if (impact >= 3) return theme.colors.riskMedium;
    return theme.colors.riskLow;
  };

  const impactColor = getImpactColor(factor.impact);

  const categoryColors: Record<string, string> = {
    complexity: '#8b5cf6',
    coverage: '#3b82f6',
    'blast-radius': '#f97316',
    sensitive: '#ef4444',
    dependencies: '#06b6d4',
  };

  return (
    <div 
      className="p-4 rounded-2xl"
      style={{ 
        background: `${impactColor}10`,
        border: `1px solid ${impactColor}25`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              background: impactColor,
              boxShadow: `0 0 6px ${impactColor}`,
            }} 
          />
          <span 
            className="text-sm font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            {factor.name}
          </span>
        </div>
        <span 
          className="text-xs font-semibold px-2 py-1 rounded-lg"
          style={{ 
            background: `${categoryColors[factor.category] || theme.colors.textMuted}20`,
            color: categoryColors[factor.category] || theme.colors.textMuted,
          }}
        >
          {factor.category}
        </span>
      </div>
      <p 
        className="text-xs leading-relaxed"
        style={{ color: theme.colors.textSecondary }}
      >
        {factor.description}
      </p>
    </div>
  );
}
