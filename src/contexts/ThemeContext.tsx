'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Theme, ThemeName, themes, defaultTheme, getTheme } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'prism-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);

  useEffect(() => {
    // Load saved theme from localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (saved && themes[saved]) {
      setThemeName(saved);
    }
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem(STORAGE_KEY, name);
  }, []);

  const cycleTheme = useCallback(() => {
    const themeNames = Object.keys(themes) as ThemeName[];
    const currentIndex = themeNames.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);
  }, [themeName, setTheme]);

  const theme = getTheme(themeName);
  const availableThemes = Object.values(themes);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, cycleTheme, availableThemes }}>
      <div
        style={{
          '--bg-primary': theme.colors.bgPrimary,
          '--bg-secondary': theme.colors.bgSecondary,
          '--bg-tertiary': theme.colors.bgTertiary,
          '--bg-card': theme.colors.bgCard,
          '--bg-card-hover': theme.colors.bgCardHover,
          '--bg-glass': theme.colors.bgGlass,
          '--border-primary': theme.colors.borderPrimary,
          '--border-secondary': theme.colors.borderSecondary,
          '--border-accent': theme.colors.borderAccent,
          '--text-primary': theme.colors.textPrimary,
          '--text-secondary': theme.colors.textSecondary,
          '--text-muted': theme.colors.textMuted,
          '--text-accent': theme.colors.textAccent,
          '--accent-primary': theme.colors.accentPrimary,
          '--accent-secondary': theme.colors.accentSecondary,
          '--accent-gradient-from': theme.colors.accentGradientFrom,
          '--accent-gradient-to': theme.colors.accentGradientTo,
          '--risk-low': theme.colors.riskLow,
          '--risk-medium': theme.colors.riskMedium,
          '--risk-high': theme.colors.riskHigh,
          '--risk-critical': theme.colors.riskCritical,
        } as React.CSSProperties}
        className="contents"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
