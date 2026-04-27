'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { theme } = useTheme();

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="flex flex-col items-center gap-8">
        {/* Animated loader */}
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-full"
            style={{ 
              border: `4px solid ${theme.colors.borderPrimary}`,
            }} 
          />
          <div 
            className="absolute inset-0 w-20 h-20 rounded-full animate-spin"
            style={{ 
              border: `4px solid transparent`,
              borderTopColor: theme.colors.accentPrimary,
              borderRightColor: theme.colors.accentSecondary,
            }} 
          />
          <div 
            className="absolute inset-2 w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            style={{ background: theme.colors.bgSecondary }}
          >
            🔍
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p 
            className="text-lg font-semibold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            {message}
          </p>
          <p 
            className="text-sm"
            style={{ color: theme.colors.textMuted }}
          >
            This may take a few seconds...
          </p>
        </div>

        {/* Progress steps */}
        <div 
          className="w-full rounded-2xl p-5"
          style={{ 
            background: theme.colors.bgSecondary,
            border: `1px solid ${theme.colors.borderPrimary}`,
          }}
        >
          <div className="space-y-3">
            <ProgressStep 
              theme={theme}
              label="Fetching PR metadata" 
              done={message.includes('files') || message.includes('Analyzing')} 
            />
            <ProgressStep 
              theme={theme}
              label="Loading changed files" 
              done={message.includes('Analyzing')} 
            />
            <ProgressStep 
              theme={theme}
              label="Analyzing impact" 
              done={false} 
              active={message.includes('Analyzing')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressStep({ 
  theme, 
  label, 
  done, 
  active = false 
}: { 
  theme: ReturnType<typeof useTheme>['theme'];
  label: string; 
  done: boolean; 
  active?: boolean;
}) {
  return (
    <div 
      className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200"
      style={{ 
        background: active ? `${theme.colors.accentPrimary}15` : 'transparent',
      }}
    >
      {done ? (
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: theme.colors.riskLow }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : active ? (
        <div 
          className="w-6 h-6 rounded-full animate-spin"
          style={{ 
            border: `3px solid ${theme.colors.borderPrimary}`,
            borderTopColor: theme.colors.accentPrimary,
          }} 
        />
      ) : (
        <div 
          className="w-6 h-6 rounded-full"
          style={{ border: `2px solid ${theme.colors.borderSecondary}` }} 
        />
      )}
      <span 
        className="font-medium"
        style={{ 
          color: done 
            ? theme.colors.textMuted 
            : active 
              ? theme.colors.textPrimary 
              : theme.colors.textMuted,
        }}
      >
        {label}
      </span>
    </div>
  );
}
