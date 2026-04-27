'use client';

import { useState } from 'react';
import { FileAnalysis, FileCategory, RiskLevel } from '@/types';
import { RiskBadge } from './RiskBadge';

interface FileListProps {
  files: FileAnalysis[];
  onFileSelect?: (file: FileAnalysis) => void;
  selectedFile?: string;
  fullHeight?: boolean;
}

const categoryIcons: Record<FileCategory, string> = {
  source: '📄',
  test: '🧪',
  config: '⚙️',
  documentation: '📝',
  asset: '🖼️',
  dependency: '📦',
  infrastructure: '🏗️',
  migration: '🗄️',
  unknown: '❓',
};

const statusColors: Record<string, string> = {
  added: 'text-green-400',
  removed: 'text-red-400',
  modified: 'text-yellow-400',
  renamed: 'text-blue-400',
};

export function FileList({ files, onFileSelect, selectedFile, fullHeight = false }: FileListProps) {
  const [filter, setFilter] = useState<'all' | RiskLevel>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'changes' | 'name'>('risk');
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const filteredFiles = files.filter(
    (f) => filter === 'all' || f.riskLevel === filter
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'risk') {
      const riskOrder: Record<RiskLevel, number> = { critical: 3, high: 2, medium: 1, low: 0 };
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    }
    if (sortBy === 'changes') {
      return b.changes - a.changes;
    }
    return a.filename.localeCompare(b.filename);
  });

  const riskCounts = {
    critical: files.filter((f) => f.riskLevel === 'critical').length,
    high: files.filter((f) => f.riskLevel === 'high').length,
    medium: files.filter((f) => f.riskLevel === 'medium').length,
    low: files.filter((f) => f.riskLevel === 'low').length,
  };

  return (
    <div className={fullHeight ? '' : 'bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden'}>
      {/* Header */}
      <div className={`px-6 py-4 ${fullHeight ? '' : 'border-b border-zinc-800'}`}>
        {!fullHeight && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Changed Files</h2>
            <span className="text-sm text-zinc-500">{files.length} files</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All ({files.length})
          </FilterButton>
          {riskCounts.critical > 0 && (
            <FilterButton
              active={filter === 'critical'}
              onClick={() => setFilter('critical')}
              variant="critical"
            >
              Critical ({riskCounts.critical})
            </FilterButton>
          )}
          {riskCounts.high > 0 && (
            <FilterButton
              active={filter === 'high'}
              onClick={() => setFilter('high')}
              variant="high"
            >
              High ({riskCounts.high})
            </FilterButton>
          )}
          {riskCounts.medium > 0 && (
            <FilterButton
              active={filter === 'medium'}
              onClick={() => setFilter('medium')}
              variant="medium"
            >
              Medium ({riskCounts.medium})
            </FilterButton>
          )}
          {riskCounts.low > 0 && (
            <FilterButton
              active={filter === 'low'}
              onClick={() => setFilter('low')}
              variant="low"
            >
              Low ({riskCounts.low})
            </FilterButton>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300"
            >
              <option value="risk">Risk Level</option>
              <option value="changes">Changes</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className={`divide-y divide-zinc-800 overflow-y-auto ${fullHeight ? 'h-[520px]' : 'max-h-[500px]'}`}>
        {sortedFiles.map((file) => (
          <FileCard
            key={file.filename}
            file={file}
            expanded={expandedFile === file.filename}
            selected={selectedFile === file.filename}
            onToggle={() =>
              setExpandedFile(expandedFile === file.filename ? null : file.filename)
            }
            onSelect={() => onFileSelect?.(file)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | RiskLevel;
}) {
  const variantClasses: Record<string, string> = {
    default: active ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300',
    critical: active ? 'bg-red-500/30 text-red-400' : 'bg-zinc-800 text-red-400/70 hover:text-red-400',
    high: active ? 'bg-orange-500/30 text-orange-400' : 'bg-zinc-800 text-orange-400/70 hover:text-orange-400',
    medium: active ? 'bg-yellow-500/30 text-yellow-400' : 'bg-zinc-800 text-yellow-400/70 hover:text-yellow-400',
    low: active ? 'bg-green-500/30 text-green-400' : 'bg-zinc-800 text-green-400/70 hover:text-green-400',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}

function FileCard({
  file,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  file: FileAnalysis;
  expanded: boolean;
  selected?: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const fileName = file.filename.split('/').pop();
  const filePath = file.filename.includes('/')
    ? file.filename.substring(0, file.filename.lastIndexOf('/'))
    : '';

  return (
    <div className={`transition-colors ${selected ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'hover:bg-zinc-800/50'}`}>
      <div
        className="px-6 py-3 flex items-center gap-3 cursor-pointer"
        onClick={onToggle}
      >
        {/* Icon */}
        <span className="text-lg">{categoryIcons[file.category]}</span>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-100 truncate">{fileName}</span>
            <span className={`text-xs ${statusColors[file.status] || 'text-zinc-400'}`}>
              {file.status}
            </span>
          </div>
          {filePath && (
            <div className="text-xs text-zinc-500 truncate">{filePath}/</div>
          )}
        </div>

        {/* Changes */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-green-400">+{file.additions}</span>
          <span className="text-red-400">-{file.deletions}</span>
        </div>

        {/* Risk badge */}
        <RiskBadge level={file.riskLevel} size="sm" showLabel={false} />

        {/* Expand icon */}
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-6 py-4 bg-zinc-800/30 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Category</div>
              <div className="text-sm text-zinc-300 capitalize">{file.category}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Test Coverage</div>
              <div className="text-sm">
                {file.category === 'test' ? (
                  <span className="text-blue-400">This is a test file</span>
                ) : file.hasTests ? (
                  <span className="text-green-400">✓ Has tests</span>
                ) : (
                  <span className="text-yellow-400">⚠ No tests found</span>
                )}
              </div>
            </div>
          </div>

          {file.riskFactors.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-zinc-500 mb-2">Risk Factors</div>
              <div className="flex flex-wrap gap-2">
                {file.riskFactors.map((factor, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-zinc-700 rounded text-zinc-300"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {file.relatedTestFile && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">Related Test</div>
              <div className="text-sm text-blue-400">{file.relatedTestFile}</div>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="mt-4 text-xs text-blue-400 hover:text-blue-300"
          >
            View in graph →
          </button>
        </div>
      )}
    </div>
  );
}
