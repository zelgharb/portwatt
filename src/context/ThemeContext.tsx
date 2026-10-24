import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'control_room';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isControlRoom: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('portwatt_theme_mode');
    return (saved as ThemeMode) || 'dark';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('portwatt_theme_mode', newMode);
  };

  const toggleTheme = () => {
    if (mode === 'dark') setMode('light');
    else if (mode === 'light') setMode('control_room');
    else setMode('dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'theme-control-room');
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'control_room') {
      root.classList.add('dark', 'theme-control-room');
    } else {
      root.classList.add('light');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      setMode, 
      toggleTheme, 
      isControlRoom: mode === 'control_room' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
