'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeState = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

type ThemeContextType = {
  theme: ThemeState;
  updateTheme: (newTheme: Partial<ThemeState>) => void;
  resetTheme: () => void;
};

const defaultTheme: ThemeState = {
  primaryColor: '#3b82f6', // blue-500
  backgroundColor: '#ffffff', // white
  textColor: '#111827', // gray-900
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(defaultTheme);

  // Load from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Error parsing theme from local storage', e);
      }
    }
  }, []);

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--bg-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    
    // Save to local storage
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeState>) => {
    setTheme((prev) => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
