'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { APIError } from '@/types';

interface ErrorStateProps {
  error: APIError;
  onRetry: (token?: string) => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { theme } = useTheme();
  const [token, setToken] = useState('');
  const isRateLimited = error.type === 'rate-limited';

  const getErrorIcon = () => {
    switch (error.type) {
      case 'rate-limited':
        return '⏱️';
      case 'not-found':
        return '🔍';
      case 'invalid-url':
        return '🔗';
      default:
        return '⚠️';
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'rate-limited':
        return 'Rate Limit Reached';
      case 'not-found':
        return 'PR Not Found';
      case 'invalid-url':
        return 'Invalid URL';
      default:
        return 'Something Went Wrong';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div 
        className="rounded-3xl p-8 text-center"
        style={{ 
          background: theme.colors.bgSecondary,
          border: `1px solid ${theme.colors.borderPrimary}`,
        }}
      >
        {/* Error Icon */}
        <div 
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl"
          style={{ 
            background: `${theme.colors.riskHigh}20`,
          }}
        >
          {getErrorIcon()}
        </div>

        {/* Error Title */}
        <h2 
          className="text-xl font-bold mb-3"
          style={{ color: theme.colors.textPrimary }}
        >
          {getErrorTitle()}
        </h2>

        {/* Error Message */}
        <p 
          className="mb-6"
          style={{ color: theme.colors.textSecondary }}
        >
          {error.message}
        </p>

        {/* Details */}
        {error.details && (
          <p 
            className="text-sm mb-6"
            style={{ color: theme.colors.textMuted }}
          >
            {error.details}
          </p>
        )}

        {/* Token Input for Rate Limit */}
        {isRateLimited && (
          <div className="mb-6 space-y-4">
            <div 
              className="p-4 rounded-xl text-left"
              style={{ 
                background: `${theme.colors.accentPrimary}10`,
                border: `1px solid ${theme.colors.accentPrimary}30`,
              }}
            >
              <p 
                className="text-sm font-medium mb-2"
                style={{ color: theme.colors.accentPrimary }}
              >
                💡 Pro tip: Add a GitHub token for 5000 requests/hour
              </p>
              <a
                href="https://github.com/settings/tokens/new?description=PR%20Reality%20Check&scopes=public_repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold inline-flex items-center gap-1 hover:underline"
                style={{ color: theme.colors.accentPrimary }}
              >
                Create token →
              </a>
            </div>
            
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your GitHub token here"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ 
                background: theme.colors.bgTertiary,
                border: `2px solid ${theme.colors.borderPrimary}`,
                color: theme.colors.textPrimary,
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onRetry(isRateLimited && token ? token : undefined)}
            className="flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-200"
            style={{ 
              background: `linear-gradient(135deg, ${theme.colors.accentGradientFrom}, ${theme.colors.accentGradientTo})`,
              color: '#fff',
              boxShadow: `0 4px 20px ${theme.colors.accentPrimary}40`,
            }}
          >
            {isRateLimited && token ? 'Retry with Token' : 'Try Again'}
          </button>
          <button
            onClick={() => onRetry()}
            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            style={{ 
              background: theme.colors.bgTertiary,
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
