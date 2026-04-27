'use client';

import { useState, useCallback } from 'react';
import { AnalysisState, FileAnalysis } from '@/types';
import { parsePRUrl, fetchPRInfo, fetchPRFiles, fetchRepoTree } from '@/lib/github';
import { performAnalysis } from '@/lib/risk-analyzer';
import { PRInput, LoadingState, ErrorState } from '@/components';
import { EnhancedGraph } from '@/components/EnhancedGraph';
import { CompactFileList } from '@/components/CompactFileList';
import { CompactSummary } from '@/components/CompactSummary';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeName, themes } from '@/lib/themes';

type MainTab = 'graph' | 'files' | 'summary';

export default function Home() {
  const { theme, themeName, setTheme, availableThemes } = useTheme();
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [lastUrl, setLastUrl] = useState('');
  const [activeTab, setActiveTab] = useState<MainTab>('graph');
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleAnalyze = useCallback(async (url: string, token?: string) => {
    setLastUrl(url);
    const parsed = parsePRUrl(url);
    if (!parsed) {
      setState({ status: 'error', error: { type: 'invalid-url', message: 'Invalid GitHub PR URL', details: 'Please enter a valid GitHub PR URL.' } });
      return;
    }
    const { owner, repo, number } = parsed;
    setState({ status: 'loading', message: 'Fetching PR metadata...' });
    const prResult = await fetchPRInfo(owner, repo, number, token);
    if (prResult.error) { setState({ status: 'error', error: prResult.error }); return; }
    setState({ status: 'loading', message: 'Loading changed files...' });
    const filesResult = await fetchPRFiles(owner, repo, number, token);
    if (filesResult.error) { setState({ status: 'error', error: filesResult.error }); return; }
    setState({ status: 'loading', message: 'Analyzing impact...' });
    const treeResult = await fetchRepoTree(owner, repo, prResult.data!.baseBranch, token);
    const repoFiles = treeResult.data || [];
    const analysis = performAnalysis(prResult.data!, filesResult.data!, repoFiles);
    setState({ status: 'success', data: analysis });
    setActiveTab('graph');
  }, []);

  const handleRetry = useCallback((token?: string) => {
    if (lastUrl && token) handleAnalyze(lastUrl, token);
    else setState({ status: 'idle' });
  }, [lastUrl, handleAnalyze]);

  const handleReset = useCallback(() => {
    setState({ status: 'idle' });
    setSelectedFile(undefined);
  }, []);

  const handleFileSelect = useCallback((file: FileAnalysis) => {
    setSelectedFile(file.filename);
  }, []);

  if (state.status === 'idle') {
    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: theme.colors.bgPrimary }}>
        <LandingHeader theme={theme} themeName={themeName} availableThemes={availableThemes} onThemeChange={setTheme} showThemePicker={showThemePicker} setShowThemePicker={setShowThemePicker} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black mb-6" style={{ color: theme.colors.textPrimary }}>
                See What Your PR <span style={{ color: theme.colors.accentPrimary }}>Actually</span> Impacts
              </h1>
              <p className="text-xl" style={{ color: theme.colors.textSecondary }}>Blast radius - Risk analysis - Missing tests - Hidden dependencies</p>
            </div>
            <PRInput onSubmit={handleAnalyze} isLoading={false} />
            <FeatureGrid theme={theme} />
          </div>
        </main>
        <LandingFooter theme={theme} />
      </div>
    );
  }

  if (state.status === 'loading') {
    return <div className="h-screen flex items-center justify-center" style={{ background: theme.colors.bgPrimary }}><LoadingState message={state.message} /></div>;
  }

  if (state.status === 'error') {
    return <div className="h-screen flex items-center justify-center" style={{ background: theme.colors.bgPrimary }}><ErrorState error={state.error} onRetry={handleRetry} /></div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: theme.colors.bgPrimary }}>
      <header className="h-16 flex items-center px-6 gap-6 shrink-0" style={{ borderBottom: '1px solid ' + theme.colors.borderPrimary, background: theme.colors.bgSecondary }}>
        <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-80">
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}>
            <path d="M16 4L4 26h24L16 4z" fill="url(#prism-main)" />
            <path d="M16 4L4 26h24L16 4z" stroke="url(#prism-stroke)" strokeWidth="1" />
            <path d="M16 10L8 22h16L16 10z" fill="url(#prism-inner)" />
            <path d="M10 22L16 10L14 22H10z" fill="rgba(255,255,255,0.15)" />
            <defs>
              <linearGradient id="prism-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
              <linearGradient id="prism-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="prism-inner" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-bold text-lg hidden sm:block" style={{ color: theme.colors.textPrimary }}>PRism</span>
        </button>
        <div className="flex-1 flex items-center gap-4">
          <span style={{ color: theme.colors.textSecondary }}>{state.data.pr.owner}/{state.data.pr.repo} #{state.data.pr.number}</span>
          <RiskPill level={state.data.riskScore.level} score={state.data.riskScore.score} theme={theme} />
        </div>
        <div className="flex items-center rounded-xl p-1" style={{ background: theme.colors.bgTertiary }}>
          <TabButton active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} label="Graph" theme={theme} />
          <TabButton active={activeTab === 'files'} onClick={() => setActiveTab('files')} label="Files" count={state.data.files.length} theme={theme} />
          <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} label="Summary" theme={theme} />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowThemePicker(!showThemePicker)} className="p-2 rounded-xl" style={{ background: theme.colors.bgTertiary, color: theme.colors.textSecondary }}>{themes[themeName].icon}</button>
            {showThemePicker && <ThemePickerDropdown theme={theme} themeName={themeName} availableThemes={availableThemes} onThemeChange={(n) => { setTheme(n); setShowThemePicker(false); }} onClose={() => setShowThemePicker(false)} />}
          </div>
          <a href={state.data.pr.htmlUrl} target="_blank" className="px-4 py-2 rounded-xl" style={{ background: theme.colors.bgTertiary, color: theme.colors.textSecondary }}>Open PR</a>
          <button onClick={handleReset} className="px-4 py-2 rounded-xl font-bold" style={{ background: theme.colors.accentPrimary, color: '#fff' }}>New Analysis</button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {activeTab === 'graph' && <EnhancedGraph nodes={state.data.impactGraph.nodes} edges={state.data.impactGraph.edges} onNodeSelect={(id) => setSelectedFile(id)} selectedNode={selectedFile} />}
        {activeTab === 'files' && <CompactFileList files={state.data.files} onFileSelect={handleFileSelect} selectedFile={selectedFile} onViewInGraph={(f) => { setSelectedFile(f); setActiveTab('graph'); }} />}
        {activeTab === 'summary' && <CompactSummary analysis={state.data} />}
      </main>
    </div>
  );
}

interface ThemeType { colors: { bgPrimary: string; bgSecondary: string; bgTertiary: string; borderPrimary: string; textPrimary: string; textSecondary: string; textMuted: string; accentPrimary: string; accentGradientFrom: string; accentGradientTo: string; riskLow: string; riskMedium: string; riskHigh: string; riskCritical: string; }; }

function LandingHeader({ theme, themeName, availableThemes, onThemeChange, showThemePicker, setShowThemePicker }: { theme: ThemeType; themeName: ThemeName; availableThemes: Array<{name: ThemeName; label: string; icon: string}>; onThemeChange: (n: ThemeName) => void; showThemePicker: boolean; setShowThemePicker: (s: boolean) => void; }) {
  return (
    <header className="h-16 flex items-center justify-between px-6" style={{ borderBottom: '1px solid ' + theme.colors.borderPrimary }}>
      <div className="flex items-center gap-3">
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}>
          <path d="M16 4L4 26h24L16 4z" fill="url(#prism-main-l)" />
          <path d="M16 4L4 26h24L16 4z" stroke="url(#prism-stroke-l)" strokeWidth="1" />
          <path d="M16 10L8 22h16L16 10z" fill="url(#prism-inner-l)" />
          <path d="M10 22L16 10L14 22H10z" fill="rgba(255,255,255,0.15)" />
          <defs>
            <linearGradient id="prism-main-l" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="prism-stroke-l" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="prism-inner-l" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>PRism</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => setShowThemePicker(!showThemePicker)} className="px-4 py-2 rounded-xl" style={{ background: theme.colors.bgSecondary, color: theme.colors.textSecondary }}>{themes[themeName].icon} {themes[themeName].label}</button>
          {showThemePicker && <ThemePickerDropdown theme={theme} themeName={themeName} availableThemes={availableThemes} onThemeChange={(n) => { onThemeChange(n); setShowThemePicker(false); }} onClose={() => setShowThemePicker(false)} />}
        </div>
        <a href="https://github.com" target="_blank" className="px-4 py-2 rounded-xl" style={{ background: theme.colors.bgSecondary, color: theme.colors.textSecondary }}>GitHub</a>
      </div>
    </header>
  );
}

function ThemePickerDropdown({ theme, themeName, availableThemes, onThemeChange, onClose }: { theme: ThemeType; themeName: ThemeName; availableThemes: Array<{name: ThemeName; label: string; icon: string}>; onThemeChange: (n: ThemeName) => void; onClose: () => void; }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 z-50 rounded-xl p-2 min-w-48 shadow-xl" style={{ background: theme.colors.bgSecondary, border: '1px solid ' + theme.colors.borderPrimary }}>
        {availableThemes.map((t) => (
          <button key={t.name} onClick={() => onThemeChange(t.name)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: themeName === t.name ? theme.colors.bgTertiary : 'transparent', color: theme.colors.textSecondary }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function LandingFooter({ theme }: { theme: ThemeType }) {
  return <footer className="h-14 flex items-center justify-center" style={{ borderTop: '1px solid ' + theme.colors.borderPrimary, color: theme.colors.textMuted }}>No data stored - Privacy-first - Runs in your browser</footer>;
}

function FeatureGrid({ theme }: { theme: ThemeType }) {
  const features = [{ icon: 'T', label: 'Blast Radius', desc: 'See what breaks' }, { icon: '!', label: 'Risk Score', desc: 'Instant assessment' }, { icon: 'X', label: 'Test Coverage', desc: 'Find gaps' }, { icon: '#', label: 'Impact Graph', desc: 'Visualize flow' }];
  return (
    <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {features.map((f, i) => <div key={i} className="text-center p-5 rounded-xl" style={{ background: theme.colors.bgSecondary, border: '1px solid ' + theme.colors.borderPrimary }}><div className="text-3xl mb-2">{f.icon}</div><div className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{f.label}</div><div className="text-xs" style={{ color: theme.colors.textMuted }}>{f.desc}</div></div>)}
    </div>
  );
}

function RiskPill({ level, score, theme }: { level: string; score: number; theme: ThemeType }) {
  const colors: Record<string, string> = { low: theme.colors.riskLow, medium: theme.colors.riskMedium, high: theme.colors.riskHigh, critical: theme.colors.riskCritical };
  const color = colors[level] || colors.medium;
  return <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: color + '20', color }}>{score} - {level.charAt(0).toUpperCase() + level.slice(1)}</span>;
}

function TabButton({ active, onClick, label, count, theme }: { active: boolean; onClick: () => void; label: string; count?: number; theme: ThemeType }) {
  return (
    <button onClick={onClick} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: active ? theme.colors.accentPrimary : 'transparent', color: active ? '#fff' : theme.colors.textMuted }}>
      {label}{count !== undefined && <span className="ml-1 px-2 py-0.5 rounded text-xs" style={{ background: active ? 'rgba(255,255,255,0.2)' : theme.colors.bgSecondary }}>{count}</span>}
    </button>
  );
}