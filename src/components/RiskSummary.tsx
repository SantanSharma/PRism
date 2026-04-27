import { RiskScore as RiskScoreType, PRAnalysis } from '@/types';
import { RiskScore, RiskBadge } from './RiskBadge';

interface RiskSummaryProps {
  analysis: PRAnalysis;
}

export function RiskSummary({ analysis }: RiskSummaryProps) {
  const { riskScore, testCoverage, stats, pr } = analysis;

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">PR Risk Analysis</h2>
          <a 
            href={pr.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-blue-400 transition-colors"
          >
            {pr.owner}/{pr.repo} #{pr.number}
          </a>
        </div>
        <RiskScore score={riskScore.score} level={riskScore.level} />
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <p className="text-zinc-300 leading-relaxed">{riskScore.summary}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 border-b border-zinc-800">
        <StatCard label="Files Changed" value={stats.totalFiles} />
        <StatCard label="Lines Added" value={pr.additions} color="text-green-400" prefix="+" />
        <StatCard label="Lines Deleted" value={pr.deletions} color="text-red-400" prefix="-" />
        <StatCard label="Avg Changes/File" value={stats.avgChangesPerFile} />
      </div>

      {/* Test Coverage */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Test Coverage</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{
                width: `${(testCoverage.hasTests / (testCoverage.hasTests + testCoverage.missingTests || 1)) * 100}%`,
              }}
            />
          </div>
          <div className="text-sm">
            <span className="text-green-400">{testCoverage.hasTests}</span>
            <span className="text-zinc-500"> / </span>
            <span className="text-zinc-300">{testCoverage.hasTests + testCoverage.missingTests}</span>
            <span className="text-zinc-500"> source files have tests</span>
          </div>
        </div>
        {testCoverage.missingTests > 0 && (
          <p className="mt-2 text-sm text-yellow-400">
            ⚠ {testCoverage.missingTests} source file(s) modified without corresponding tests
          </p>
        )}
      </div>

      {/* Risk Factors */}
      {riskScore.factors.length > 0 && (
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Risk Factors</h3>
          <div className="space-y-2">
            {riskScore.factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <div className={`mt-0.5 ${getImpactColor(factor.impact)}`}>
                  {getImpactIcon(factor.impact)}
                </div>
                <div>
                  <div className="font-medium text-zinc-200">{factor.name}</div>
                  <div className="text-sm text-zinc-400">{factor.description}</div>
                </div>
                <CategoryBadge category={factor.category} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {riskScore.recommendations.length > 0 && (
        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {riskScore.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-300">
                <span className="text-blue-400 mt-0.5">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  color = 'text-zinc-100',
  prefix = '' 
}: { 
  label: string; 
  value: number; 
  color?: string;
  prefix?: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>
        {prefix}{value.toLocaleString()}
      </div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    complexity: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    coverage: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'blast-radius': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    sensitive: 'bg-red-500/20 text-red-400 border-red-500/30',
    dependencies: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${colors[category] || 'bg-zinc-700 text-zinc-400'}`}>
      {category}
    </span>
  );
}

function getImpactColor(impact: number): string {
  if (impact >= 8) return 'text-red-400';
  if (impact >= 5) return 'text-orange-400';
  if (impact >= 3) return 'text-yellow-400';
  return 'text-zinc-400';
}

function getImpactIcon(impact: number): string {
  if (impact >= 8) return '🔴';
  if (impact >= 5) return '🟠';
  if (impact >= 3) return '🟡';
  return '🟢';
}
