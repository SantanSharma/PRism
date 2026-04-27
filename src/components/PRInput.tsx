'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PRInputProps {
  onSubmit: (url: string, token?: string) => void;
  isLoading: boolean;
}

export function PRInput({ onSubmit, isLoading }: PRInputProps) {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (url.trim()) {
        onSubmit(url.trim(), token.trim() || undefined);
      }
    },
    [url, token, onSubmit]
  );

  const isValidUrl = /github\.com\/[^/]+\/[^/]+\/pull\/\d+|^[^/]+\/[^/#]+#\d+$/.test(url.trim());

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div 
          className="relative rounded-2xl transition-all duration-300"
          style={{
            boxShadow: isFocused 
              ? `0 0 0 4px ${theme.colors.accentPrimary}30, 0 20px 40px ${theme.colors.bgPrimary}`
              : `0 10px 30px ${theme.colors.bgPrimary}`,
          }}
        >
          <label htmlFor="pr-url" className="sr-only">
            GitHub PR URL
          </label>
          <div 
            className="flex items-center rounded-2xl overflow-hidden"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `2px solid ${isFocused ? theme.colors.accentPrimary : theme.colors.borderPrimary}`,
            }}
          >
            <div 
              className="px-5 flex items-center"
              style={{ color: theme.colors.textMuted }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <input
              id="pr-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Paste GitHub PR URL or owner/repo#123"
              className="flex-1 px-2 py-4 text-lg bg-transparent outline-none"
              style={{ 
                color: theme.colors.textPrimary,
              }}
              disabled={isLoading}
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              disabled={!isValidUrl || isLoading}
              className="flex items-center gap-2 px-6 py-3 m-2 rounded-xl font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: isValidUrl && !isLoading
                  ? `linear-gradient(135deg, ${theme.colors.accentGradientFrom}, ${theme.colors.accentGradientTo})`
                  : theme.colors.bgTertiary,
                color: isValidUrl && !isLoading ? '#fff' : theme.colors.textMuted,
                boxShadow: isValidUrl && !isLoading ? `0 4px 20px ${theme.colors.accentPrimary}40` : 'none',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm px-2">
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="flex items-center gap-2 transition-colors duration-200"
            style={{ color: theme.colors.textMuted }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="font-medium">{showToken ? 'Hide token' : 'Add GitHub token'}</span>
          </button>
          <span style={{ color: theme.colors.textMuted }}>
            For private repos
          </span>
        </div>

        {showToken && (
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxx"
            className="w-full px-5 py-3 rounded-xl text-sm outline-none transition-all duration-200"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `2px solid ${theme.colors.borderPrimary}`,
              color: theme.colors.textPrimary,
            }}
          />
        )}
      </form>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <span 
          className="text-sm font-medium px-3 py-1.5"
          style={{ color: theme.colors.textMuted }}
        >
          Try:
        </span>
        {[
          { label: 'react#31606', full: 'facebook/react#31606' },
          { label: 'next.js#78159', full: 'vercel/next.js#78159' },
          { label: 'vscode#242831', full: 'microsoft/vscode#242831' },
        ].map((example) => (
          <button
            key={example.full}
            onClick={() => setUrl(`https://github.com/${example.full.replace('#', '/pull/')}`)}
            className="text-sm px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              background: theme.colors.bgSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
              color: theme.colors.textSecondary,
            }}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
