'use client';

import { useState, useMemo } from 'react';
import { FileAnalysis, RiskLevel, FileCategory } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface CompactFileListProps {
  files: FileAnalysis[];
  onFileSelect?: (file: FileAnalysis) => void;
  selectedFile?: string;
  onViewInGraph?: (filename: string) => void;
}

const categoryConfig: Record<FileCategory, { icon: string; label: string }> = {
  source: { icon: '💻', label: 'Source' },
  test: { icon: '🧪', label: 'Test' },
  config: { icon: '⚙️', label: 'Config' },
  documentation: { icon: '📝', label: 'Docs' },
  asset: { icon: '🎨', label: 'Asset' },
  dependency: { icon: '📦', label: 'Deps' },
  infrastructure: { icon: '🏗️', label: 'Infra' },
  migration: { icon: '🗄️', label: 'Migration' },
  unknown: { icon: '📄', label: 'Other' },
};

export function CompactFileList({ files, onFileSelect, selectedFile, onViewInGraph }: CompactFileListProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | RiskLevel>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'risk' | 'changes'>('risk');

  const filteredFiles = useMemo(() => {
    let result = files.filter(f => {
      if (filter !== 'all' && f.riskLevel !== filter) return false;
      if (search && !f.filename.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'risk') {
        const order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.riskLevel] - order[b.riskLevel];
      }
      if (sortBy === 'changes') {
        return (b.additions + b.deletions) - (a.additions + a.deletions);
      }
      return a.filename.localeCompare(b.filename);
    });

    return result;
  }, [files, filter, search, sortBy]);

  const riskCounts = useMemo(() => ({
    all: files.length,
    critical: files.filter(f => f.riskLevel === 'critical').length,
    high: files.filter(f => f.riskLevel === 'high').length,
    medium: files.filter(f => f.riskLevel === 'medium').length,
    low: files.filter(f => f.riskLevel === 'low').length,
  }), [files]);

  const totalChanges = useMemo(() => ({
    additions: files.reduce((s, f) => s + f.additions, 0),
    deletions: files.reduce((s, f) => s + f.deletions, 0),
  }), [files]);

  const getRiskColor = (level: RiskLevel) => {
    const colors: Record<RiskLevel, string> = {
      low: theme.colors.riskLow,
      medium: theme.colors.riskMedium,
      high: theme.colors.riskHigh,
      critical: theme.colors.riskCritical,
    };
    return colors[level];
  };

  return (
    <div className="h-full flex flex-col" style={{ background: theme.colors.bgPrimary }}>
      {/* Toolbar */}
      <div 
        className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ borderColor: theme.colors.borderPrimary }}
      >
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: theme.colors.textMuted }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 outline-none"
            style={{
              background: theme.colors.bgSecondary,
              border: `2px solid ${theme.colors.borderPrimary}`,
              color: theme.colors.textPrimary,
            }}
          />
        </div>

        {/* Risk Filters */}
        <div 
          className="flex items-center rounded-2xl p-1.5"
          style={{ 
            background: theme.colors.bgSecondary,
            border: `1px solid ${theme.colors.borderPrimary}`,
          }}
        >
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((level) => {
            const count = riskCounts[level];
            if (level !== 'all' && count === 0) return null;
            const isActive = filter === level;
            const color = level === 'all' ? theme.colors.textPrimary : getRiskColor(level);
            
            return (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: isActive 
                    ? level === 'all' ? theme.colors.bgTertiary : `${color}20`
                    : 'transparent',
                  color: isActive ? color : theme.colors.textMuted,
                }}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                <span 
                  className="px-1.5 py-0.5 rounded-lg text-xs"
                  style={{ 
                    background: isActive ? `${color}30` : theme.colors.bgTertiary,
                    color: isActive ? color : theme.colors.textMuted,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl text-sm font-medium outline-none cursor-pointer"
            style={{
              background: theme.colors.bgSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
              color: theme.colors.textSecondary,
            }}
          >
            <option value="risk">Sort by Risk</option>
            <option value="changes">Sort by Changes</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* View Toggle */}
          <div 
            className="flex items-center rounded-xl p-1"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <button
              onClick={() => setView('list')}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                background: view === 'list' ? theme.colors.bgTertiary : 'transparent',
                color: view === 'list' ? theme.colors.textPrimary : theme.colors.textMuted,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setView('grid')}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                background: view === 'grid' ? theme.colors.bgTertiary : 'transparent',
                color: view === 'grid' ? theme.colors.textPrimary : theme.colors.textMuted,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === 'list' ? (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <FileRow
                key={file.filename}
                file={file}
                selected={selectedFile === file.filename}
                onClick={() => onFileSelect?.(file)}
                onViewInGraph={() => onViewInGraph?.(file.filename)}
                theme={theme}
                getRiskColor={getRiskColor}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.filename}
                file={file}
                selected={selectedFile === file.filename}
                onClick={() => onFileSelect?.(file)}
                theme={theme}
                getRiskColor={getRiskColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div 
        className="h-14 border-t flex items-center justify-between px-6"
        style={{ 
          borderColor: theme.colors.borderPrimary,
          background: theme.colors.bgSecondary,
        }}
      >
        <div className="flex items-center gap-6">
          <span style={{ color: theme.colors.textSecondary }} className="text-sm font-medium">
            {filteredFiles.length} of {files.length} files
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: theme.colors.statusAdded }}>
              +{totalChanges.additions.toLocaleString()}
            </span>
            <span style={{ color: theme.colors.textMuted }}>/</span>
            <span className="text-sm font-bold" style={{ color: theme.colors.statusRemoved }}>
              -{totalChanges.deletions.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileRow({ 
  file, 
  selected, 
  onClick, 
  onViewInGraph, 
  theme, 
  getRiskColor 
}: { 
  file: FileAnalysis; 
  selected: boolean;
  onClick: () => void;
  onViewInGraph: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  getRiskColor: (level: RiskLevel) => string;
}) {
  const fileName = file.filename.split('/').pop() || file.filename;
  const filePath = file.filename.includes('/') ? file.filename.substring(0, file.filename.lastIndexOf('/')) : '';
  const riskColor = getRiskColor(file.riskLevel);
  const config = categoryConfig[file.category];

  const statusColors: Record<string, string> = {
    added: theme.colors.statusAdded,
    modified: theme.colors.statusModified,
    removed: theme.colors.statusRemoved,
    renamed: theme.colors.statusRenamed,
  };

  return (
    <div 
      className="group flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200"
      style={{
        background: selected ? `${theme.colors.accentPrimary}15` : theme.colors.bgSecondary,
        border: `2px solid ${selected ? theme.colors.accentPrimary : theme.colors.borderPrimary}`,
        boxShadow: selected ? `0 0 20px ${theme.colors.accentPrimary}20` : 'none',
      }}
      onClick={onClick}
    >
      {/* Category Icon */}
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${riskColor}20` }}
      >
        {config.icon}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span 
            className="font-semibold text-sm truncate"
            style={{ color: theme.colors.textPrimary }}
          >
            {fileName}
          </span>
          <span 
            className="px-2 py-0.5 rounded-lg text-xs font-semibold uppercase"
            style={{ 
              background: `${statusColors[file.status]}20`,
              color: statusColors[file.status],
            }}
          >
            {file.status}
          </span>
        </div>
        {filePath && (
          <div 
            className="text-xs truncate font-medium"
            style={{ color: theme.colors.textMuted }}
          >
            {filePath}/
          </div>
        )}
      </div>

      {/* Changes */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <span className="text-xs font-bold" style={{ color: theme.colors.statusAdded }}>
            +{file.additions}
          </span>
          <span style={{ color: theme.colors.textMuted }} className="mx-1">/</span>
          <span className="text-xs font-bold" style={{ color: theme.colors.statusRemoved }}>
            -{file.deletions}
          </span>
        </div>
        
        {/* Risk Indicator */}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ 
            background: riskColor,
            boxShadow: `0 0 8px ${riskColor}60`,
          }} 
        />

        {/* View in Graph Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onViewInGraph(); }}
          className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{ 
            background: theme.colors.bgTertiary,
            color: theme.colors.accentPrimary,
          }}
          title="View in graph"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function FileCard({ 
  file, 
  selected, 
  onClick, 
  theme,
  getRiskColor,
}: { 
  file: FileAnalysis; 
  selected: boolean;
  onClick: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  getRiskColor: (level: RiskLevel) => string;
}) {
  const fileName = file.filename.split('/').pop() || file.filename;
  const riskColor = getRiskColor(file.riskLevel);
  const config = categoryConfig[file.category];

  return (
    <div 
      className="p-4 rounded-2xl cursor-pointer transition-all duration-200 group"
      style={{
        background: selected ? `${theme.colors.accentPrimary}15` : theme.colors.bgSecondary,
        border: `2px solid ${selected ? theme.colors.accentPrimary : theme.colors.borderPrimary}`,
        boxShadow: selected ? `0 0 20px ${theme.colors.accentPrimary}20` : 'none',
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${riskColor}20` }}
        >
          {config.icon}
        </div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ 
            background: riskColor,
            boxShadow: `0 0 8px ${riskColor}60`,
          }} 
        />
      </div>
      <div 
        className="text-sm font-semibold truncate mb-2" 
        style={{ color: theme.colors.textPrimary }}
        title={fileName}
      >
        {fileName}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">
          <span style={{ color: theme.colors.statusAdded }}>+{file.additions}</span>
          <span style={{ color: theme.colors.textMuted }} className="mx-1">/</span>
          <span style={{ color: theme.colors.statusRemoved }}>-{file.deletions}</span>
        </div>
        <span 
          className="text-xs font-medium px-2 py-0.5 rounded-lg"
          style={{ 
            background: theme.colors.bgTertiary,
            color: theme.colors.textMuted,
          }}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
